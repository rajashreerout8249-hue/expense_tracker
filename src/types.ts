export type TransactionType = 'income' | 'expense';

export type Transaction = {
  id: string;
  title: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  paymentMethod?: string;
  note?: string;
};

export type Note = {
  id: string;
  title: string;
  description: string;
  category: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  dueDate: string;
  dueTime: string;
  completed: boolean;
  createdAt: string;
  notificationId?: string;
  reminderMinutes?: number;
  emailReminder?: boolean;
};

export type EventItem = {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  repeat: 'None' | 'Daily' | 'Weekly' | 'Monthly';
  reminder: boolean;
  notificationId?: string;
  reminderMinutes?: number;
  emailReminder?: boolean;
  createdAt: string;
};

export type Reminder = {
  id: string;

  title: string;

  description: string;

  type:
    | 'Task'
    | 'Event'
    | 'Payment'
    | 'Note'
    | 'General';

  date: string;

  time: string;

  reminderMinutes: number;

  repeat:
    | 'None'
    | 'Daily'
    | 'Weekly'
    | 'Monthly'
    | 'Custom';

  customRepeatValue?: number;

  customRepeatUnit?:
    | 'Minutes'
    | 'Hours'
    | 'Days'
    | 'Weeks'
    | 'Months';

  status:
    | 'Pending'
    | 'Completed'
    | 'Snoozed'
    | 'Rescheduled'
    | 'Missed';

  notificationId?: string;

  emailReminder: boolean;

  completedAt?: string;

  createdAt: string;
};
export type RecurringFrequency = 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';

export type RecurringExpense = {
  id: string;
  title: string;
  amount: number;
  category: string;
  frequency: RecurringFrequency;
  startDate: string;
  nextDueDate: string;
  active: boolean;
};