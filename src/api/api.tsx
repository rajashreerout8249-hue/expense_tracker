import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://192.168.29.21:5000';

const request = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  try {
    const token = await AsyncStorage.getItem('token');

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });

    const text = await response.text();

    let data;

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: text };
    }

    if (!response.ok) {
      throw new Error(
        data?.message || `Request failed: ${response.status}`
      );
    }

    return data;
  } catch (error: any) {
    console.log('API ERROR:', error?.message);
    throw error;
  }
};

/* =========================
   TRANSACTIONS
========================= */

export const getTransactions = () =>
  request('/api/transactions');

export const addTransactionApi = (transaction: any) =>
  request('/api/transactions', {
    method: 'POST',
    body: JSON.stringify(transaction),
  });

export const updateTransactionApi = (
  id: string,
  transaction: any
) =>
  request(`/api/transactions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(transaction),
  });

export const deleteTransactionApi = (id: string) =>
  request(`/api/transactions/${id}`, {
    method: 'DELETE',
  });

/* =========================
   NOTES
========================= */

export const getNotes = () =>
  request('/api/notes');

export const addNoteApi = (note: any) =>
  request('/api/notes', {
    method: 'POST',
    body: JSON.stringify(note),
  });

export const updateNoteApi = (
  id: string,
  note: any
) =>
  request(`/api/notes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(note),
  });

export const deleteNoteApi = (id: string) =>
  request(`/api/notes/${id}`, {
    method: 'DELETE',
  });

/* =========================
   TASKS
========================= */

export const getTasks = () =>
  request('/api/tasks');

export const addTaskApi = (task: any) =>
  request('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(task),
  });

export const updateTaskApi = (
  id: string,
  task: any
) =>
  request(`/api/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(task),
  });

export const deleteTaskApi = (id: string) =>
  request(`/api/tasks/${id}`, {
    method: 'DELETE',
  });

/* =========================
   EVENTS
========================= */

export const getEvents = () =>
  request('/api/events');

export const addEventApi = (event: any) =>
  request('/api/events', {
    method: 'POST',
    body: JSON.stringify(event),
  });

export const updateEventApi = (
  id: string,
  event: any
) =>
  request(`/api/events/${id}`, {
    method: 'PUT',
    body: JSON.stringify(event),
  });

export const deleteEventApi = (id: string) =>
  request(`/api/events/${id}`, {
    method: 'DELETE',
  });

/* =========================
   REMINDERS
========================= */

export const getReminders = () =>
  request('/api/reminders');

export const addReminderApi = (reminder: any) =>
  request('/api/reminders', {
    method: 'POST',
    body: JSON.stringify(reminder),
  });

export const updateReminderApi = (
  id: string,
  reminder: any
) =>
  request(`/api/reminders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(reminder),
  });

export const deleteReminderApi = (id: string) =>
  request(`/api/reminders/${id}`, {
    method: 'DELETE',
  });

/* =========================
   BACKUP
========================= */

export const backupDataApi = (data: any) =>
  request('/api/backup', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const restoreDataApi = () =>
  request('/api/backup');