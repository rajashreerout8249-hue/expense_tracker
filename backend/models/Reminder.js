const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  type: { type: String, enum: ["Task","Event","Payment","Note","General"], default: "General" },
  date: { type: String, required: true },
  time: { type: String, required: true },
  reminderMinutes: { type: Number, default: 0 },
  repeat: { type: String, enum: ["None","Daily","Weekly","Monthly","Custom"], default: "None" },
  status: { type: String, enum: ["Pending","Completed","Snoozed","Rescheduled","Missed"], default: "Pending" },
  pushToken: { type: String, default: "" },
  emailReminder: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Reminder", reminderSchema);
