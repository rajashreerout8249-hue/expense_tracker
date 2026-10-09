const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  date: { type: String, required: true },
  time: { type: String, default: "" },
  location: { type: String, default: "" },
  completed: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Event", eventSchema);
