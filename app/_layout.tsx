import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as Notifications from 'expo-notifications';

import { ExpenseProvider } from '../src/context/ExpenseContext';
import { prepareNotifications } from '../src/services/notificationService';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        await prepareNotifications();
      } catch (error) {
        console.log(
          'Notification setup error:',
          error
        );
      }
    };

    setupNotifications();
  }, []);

  return (
    <ExpenseProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="otp" />
        <Stack.Screen name="add-transaction" />
        <Stack.Screen name="history" />
        <Stack.Screen name="budget" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="edit-profile" />
        <Stack.Screen name="account-settings" />
        <Stack.Screen name="currency" />
        <Stack.Screen name="privacy" />
        <Stack.Screen name="app-settings" />
        <Stack.Screen name="Notes" />
        <Stack.Screen name="tasks" />
        <Stack.Screen name="events" />
        <Stack.Screen name="activity" />
        <Stack.Screen name="reminders" />
        <Stack.Screen name="notifications" />
      </Stack>
    </ExpenseProvider>
  );
}