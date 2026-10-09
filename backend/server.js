const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

/* =========================
   MIDDLEWARE
========================= */

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Email/password authentication routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

/* =========================
   TEST ROUTE
========================= */

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Expense Tracker Backend is running',
  });
});

/* =========================
   TRANSACTION ROUTE
========================= */

const transactionRoutes = require('./routes/transactions');

app.use(
  '/api/transactions',
  transactionRoutes
);

/* =========================
   MONGODB CONNECTION
========================= */

const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb://127.0.0.1:27017/expense_tracker';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((error) => {
    console.error(
      'MongoDB connection error:',
      error
    );
  });

/* =========================
   SERVER
========================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(
    `Server running on port ${PORT}`
  );
});