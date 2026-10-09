const express = require('express');
const crypto = require('crypto');
const User = require('../models/User');
const router = express.Router();

const hashPassword = (password, salt = crypto.randomBytes(16).toString('hex')) => {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
};
const verifyPassword = (password, stored) => {
  const [salt, hash] = String(stored || '').split(':');
  if (!salt || !hash) return false;
  const actual = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
};
const createToken = () => crypto.randomBytes(32).toString('hex');

router.post('/register', async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (!name || name.length > 100) return res.status(400).json({ success: false, message: 'Enter a valid name.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ success: false, message: 'Enter a valid email address.' });
    if (password.length < 8 || password.length > 128) return res.status(400).json({ success: false, message: 'Password must be 8–128 characters.' });
    if (await User.findOne({ email })) return res.status(409).json({ success: false, message: 'An account with this email already exists. Please log in.' });
    const user = await User.create({ name, email, passwordHash: hashPassword(password) });
    return res.status(201).json({ success: true, message: 'Account created.', token: createToken(), user: { id: String(user._id), name: user.name, email: user.email } });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    console.error('Register error:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to create account.' });
  }
});
router.post('/login', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password) return res.status(400).json({ success: false, message: 'Enter a valid email and password.' });
    const user = await User.findOne({ email });
    if (!user || !verifyPassword(password, user.passwordHash)) return res.status(401).json({ success: false, message: 'Incorrect email or password.' });
    return res.json({ success: true, message: 'Login successful.', token: createToken(), user: { id: String(user._id), name: user.name, email: user.email } });
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to log in.' });
  }
});
module.exports = router;
