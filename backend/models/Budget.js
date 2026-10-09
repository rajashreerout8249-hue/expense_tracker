const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema({
  category: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0 },
  month: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Budget", budgetSchema);
