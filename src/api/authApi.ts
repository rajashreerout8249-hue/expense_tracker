import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.29.21:5000';

async function postAuth(path: string, body: Record<string, string>) {
  const response = await fetch(`${API_URL}/api/auth/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.success) throw new Error(data.message || 'Authentication failed.');
  if (data.token) {
    await AsyncStorage.multiSet([
      ['authToken', data.token],
      ['userEmail', data.user?.email || body.email || ''],
      ['userName', data.user?.name || body.name || ''],
    ]);
  }
  return data;
}
export function loginWithEmail(email: string, password: string) {
  return postAuth('login', { email, password });
}
export function registerWithEmail(name: string, email: string, password: string) {
  return postAuth('register', { name, email, password });
}
export async function logout() {
  await AsyncStorage.multiRemove(['authToken', 'userPhone', 'userEmail', 'userName']);
}
export async function isLoggedIn() {
  return Boolean(await AsyncStorage.getItem('authToken'));
}
