const express = require('express');

const router = express.Router();

const Transaction = require('../models/Transaction');

/* GET ALL */

router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to get transactions',
    });
  }
});

/* ADD */

router.post('/', async (req, res) => {
  try {
    const transaction = await Transaction.create(req.body);

    res.status(201).json(transaction);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to add transaction',
    });
  }
});

/* UPDATE */

router.put('/:id', async (req, res) => {
  try {
    const transaction =
      await Transaction.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!transaction) {
      return res.status(404).json({
        message: 'Transaction not found',
      });
    }

    res.json(transaction);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to update transaction',
    });
  }
});

/* DELETE */

router.delete('/:id', async (req, res) => {
  try {
    const transaction =
      await Transaction.findByIdAndDelete(
        req.params.id
      );

    if (!transaction) {
      return res.status(404).json({
        message: 'Transaction not found',
      });
    }

    res.json({
      message: 'Transaction deleted',
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: 'Failed to delete transaction',
    });
  }
});

module.exports = router;