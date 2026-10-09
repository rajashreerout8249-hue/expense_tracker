const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    type: {
      type: String,
      enum: ['income', 'expense'],
      required: true,
    },

    category: {
      type: String,
      default: 'Other',
    },

    paymentMethod: {
      type: String,
      default: 'Cash',
    },

    date: {
      type: String,
      required: true,
    },

    note: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  'Transaction',
  transactionSchema
);