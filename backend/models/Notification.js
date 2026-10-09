const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, default: "" },
    type: {
      type: String,
      enum: ["Reminder", "Task", "Event", "Payment", "Note", "General"],
      default: "General",
    },
    scheduledAt: { type: Date, default: null },
    reminderMinutes: { type: Number, default: 0 },
    repeat: {
      type: String,
      enum: ["None", "Daily", "Weekly", "Monthly", "Custom"],
      default: "None",
    },
    customRepeatValue: { type: Number, default: null },
    customRepeatUnit: {
      type: String,
      enum: ["Minutes", "Hours", "Days", "Weeks", "Months", null],
      default: null,
    },
    email: { type: String, default: "", trim: true, lowercase: true },
    emailReminder: { type: Boolean, default: false },
    emailSent: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["Pending", "Completed", "Snoozed", "Rescheduled", "Missed"],
      default: "Pending",
    },
    read: { type: Boolean, default: false },
    localNotificationId: { type: String, default: "" },
    sourceId: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
