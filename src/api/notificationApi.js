import API_URL from './api';

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  if (!response.ok) throw new Error(`Notification API failed: ${response.status}`);
  return response.json();
}

export const getNotifications = () => request('/api/notifications');
export const createNotification = (notification) => request('/api/notifications', { method: 'POST', body: JSON.stringify(notification) });
export const markNotificationRead = id => request(`/api/notifications/${id}/read`, { method: 'PUT' });
export const markNotificationStatus = (id, status) => request(`/api/notifications/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
export const markAllNotificationsRead = () => request('/api/notifications/read-all', { method: 'PUT' });
export const deleteNotification = id => request(`/api/notifications/${id}`, { method: 'DELETE' });
