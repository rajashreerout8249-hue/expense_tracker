import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export type RepeatType =
  | 'None'
  | 'Daily'
  | 'Weekly'
  | 'Monthly'
  | 'Custom';

export type NotificationType =
  | 'Reminder'
  | 'Task'
  | 'Event'
  | 'Payment'
  | 'Note'
  | 'General';

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  'http://192.168.29.21:5000';

/*
 * ---------------------------------------------------------
 * NOTIFICATION HANDLER
 * ---------------------------------------------------------
 */

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/*
 * ---------------------------------------------------------
 * PREPARE NOTIFICATIONS
 * ---------------------------------------------------------
 */

export async function prepareNotifications(): Promise<boolean> {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(
        'reminders',
        {
          name: 'Reminders',
          importance:
            Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lockscreenVisibility:
            Notifications.AndroidNotificationVisibility.PUBLIC,
        }
      );
    }

    const permissions =
      await Notifications.getPermissionsAsync();

    if (permissions.status !== 'granted') {
      const requested =
        await Notifications.requestPermissionsAsync();

      return requested.status === 'granted';
    }

    return true;
  } catch (error) {
    console.log(
      'Notification permission error:',
      error
    );

    return false;
  }
}

/*
 * ---------------------------------------------------------
 * CANCEL NOTIFICATION
 * ---------------------------------------------------------
 */

export async function cancelNotification(
  id?: string
): Promise<void> {
  if (!id) return;

  try {
    await Notifications.cancelScheduledNotificationAsync(
      id
    );
  } catch (error) {
    console.log(
      'Cancel notification error:',
      error
    );
  }
}

/*
 * ---------------------------------------------------------
 * COMBINE DATE + TIME
 *
 * Example:
 * 2026-10-07 + 11:04 AM
 *
 * Returns local Date object.
 * ---------------------------------------------------------
 */

export function combineDateTime(
  date: string,
  time: string
): Date | null {
  try {
    const parts = time.trim().split(/\s+/);

    if (parts.length !== 2) {
      return null;
    }

    const [rawTime, rawAmPm] = parts;

    const ampm = rawAmPm.toUpperCase();

    const timeParts = rawTime.split(':');

    if (timeParts.length !== 2) {
      return null;
    }

    const rawHour = Number(timeParts[0]);
    const rawMinute = Number(timeParts[1]);

    if (
      Number.isNaN(rawHour) ||
      Number.isNaN(rawMinute)
    ) {
      return null;
    }

    if (
      rawHour < 1 ||
      rawHour > 12 ||
      rawMinute < 0 ||
      rawMinute > 59
    ) {
      return null;
    }

    if (ampm !== 'AM' && ampm !== 'PM') {
      return null;
    }

    let hour = rawHour;

    if (ampm === 'PM' && hour !== 12) {
      hour += 12;
    }

    if (ampm === 'AM' && hour === 12) {
      hour = 0;
    }

    const dateParts = date.split('-');

    if (dateParts.length !== 3) {
      return null;
    }

    const year = Number(dateParts[0]);
    const month = Number(dateParts[1]);
    const day = Number(dateParts[2]);

    if (
      Number.isNaN(year) ||
      Number.isNaN(month) ||
      Number.isNaN(day)
    ) {
      return null;
    }

    const result = new Date();

    result.setFullYear(
      year,
      month - 1,
      day
    );

    result.setHours(
      hour,
      rawMinute,
      0,
      0
    );

    return result;
  } catch (error) {
    console.log(
      'combineDateTime error:',
      error
    );

    return null;
  }
}

/*
 * ---------------------------------------------------------
 * SCHEDULE NORMAL NOTIFICATION
 * ---------------------------------------------------------
 */

export async function scheduleLocalNotification(
  options: {
    title: string;
    body?: string;
    date: Date;
    repeat?: RepeatType;
    type?: NotificationType;
    sourceId?: string;
  }
): Promise<string | null> {
  try {
    const allowed =
      await prepareNotifications();

    if (!allowed) {
      return null;
    }

    if (
      Number.isNaN(
        options.date.getTime()
      )
    ) {
      return null;
    }

    if (
      options.date.getTime() <=
      Date.now()
    ) {
      return null;
    }

    const repeat =
      options.repeat || 'None';

    let trigger: any;

    /*
     * DAILY
     */

    if (repeat === 'Daily') {
      trigger = {
        type:
          Notifications
            .SchedulableTriggerInputTypes
            .DAILY,

        hour:
          options.date.getHours(),

        minute:
          options.date.getMinutes(),
      };
    }

    /*
     * WEEKLY
     */

    else if (repeat === 'Weekly') {
      trigger = {
        type:
          Notifications
            .SchedulableTriggerInputTypes
            .WEEKLY,

        weekday:
          options.date.getDay() === 0
            ? 1
            : options.date.getDay() + 1,

        hour:
          options.date.getHours(),

        minute:
          options.date.getMinutes(),
      };
    }

    /*
     * MONTHLY
     */

    else if (repeat === 'Monthly') {
      trigger = {
        type:
          Notifications
            .SchedulableTriggerInputTypes
            .MONTHLY,

        day:
          options.date.getDate(),

        hour:
          options.date.getHours(),

        minute:
          options.date.getMinutes(),
      };
    }

    /*
     * ONE TIME
     */

    else {
      trigger = {
        type:
          Notifications
            .SchedulableTriggerInputTypes
            .DATE,

        date: options.date,
      };
    }

    const notificationId =
      await Notifications.scheduleNotificationAsync(
        {
          content: {
            title: options.title,

            body:
              options.body || '',

            data: {
              type:
                options.type ||
                'General',

              sourceId:
                options.sourceId ||
                '',
            },

            ...(Platform.OS === 'android'
              ? {
                  channelId:
                    'reminders',
                }
              : {}),
          },

          trigger,
        }
      );

    return notificationId;
  } catch (error) {
    console.log(
      'scheduleLocalNotification error:',
      error
    );

    return null;
  }
}

/*
 * ---------------------------------------------------------
 * CHECK NEXT TRIGGER DATE
 * ---------------------------------------------------------
 */

export async function getScheduledTriggerDate(
  date: Date
): Promise<number | null> {
  try {
    const result =
      await Notifications.getNextTriggerDateAsync(
        {
          type:
            Notifications
              .SchedulableTriggerInputTypes
              .DATE,

          date,
        } as any
      );

    return result;
  } catch (error) {
    console.log(
      'getScheduledTriggerDate error:',
      error
    );

    return null;
  }
}

/*
 * ---------------------------------------------------------
 * REGISTERED EMAIL
 * ---------------------------------------------------------
 */

export async function getRegisteredEmail(): Promise<string> {
  try {
    return (
      (await AsyncStorage.getItem(
        'registeredEmail'
      )) || ''
    );
  } catch (error) {
    return '';
  }
}

/*
 * ---------------------------------------------------------
 * SAVE NOTIFICATION TO BACKEND
 * ---------------------------------------------------------
 */

export async function saveNotificationToBackend(
  payload: Record<string, any>
): Promise<any> {
  try {
    const response = await fetch(
      `${API_URL}/api/notifications`,
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json',
        },

        body: JSON.stringify(
          payload
        ),
      }
    );

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.log(
      'Backend notification save error:',
      error
    );

    return null;
  }
}

/*
 * ---------------------------------------------------------
 * ADD CUSTOM REPEAT
 * ---------------------------------------------------------
 */

export function addRepeat(
  date: Date,
  value: number,
  unit: string
): Date {
  const next =
    new Date(date);

  if (unit === 'Minutes') {
    next.setMinutes(
      next.getMinutes() + value
    );
  }

  else if (unit === 'Hours') {
    next.setHours(
      next.getHours() + value
    );
  }

  else if (unit === 'Days') {
    next.setDate(
      next.getDate() + value
    );
  }

  else if (unit === 'Weeks') {
    next.setDate(
      next.getDate() +
        value * 7
    );
  }

  else if (unit === 'Months') {
    next.setMonth(
      next.getMonth() + value
    );
  }

  return next;
}

/*
 * ---------------------------------------------------------
 * CUSTOM REPEATING NOTIFICATIONS
 * ---------------------------------------------------------
 *
 * Schedules up to 30 notifications.
 * ---------------------------------------------------------
 */

export async function scheduleCustomNotifications(
  options: {
    title: string;
    body?: string;
    firstDate: Date;
    value: number;
    unit: string;
    type?: NotificationType;
    sourceId?: string;
  }
): Promise<string[]> {
  try {
    const allowed =
      await prepareNotifications();

    if (
      !allowed ||
      options.value <= 0
    ) {
      return [];
    }

    const ids: string[] = [];

    let date =
      new Date(
        options.firstDate
      );

    for (
      let i = 0;
      i < 30;
      i += 1
    ) {
      if (
        date.getTime() >
        Date.now()
      ) {
        const id =
          await Notifications.scheduleNotificationAsync(
            {
              content: {
                title:
                  options.title,

                body:
                  options.body ||
                  '',

                data: {
                  type:
                    options.type ||
                    'General',

                  sourceId:
                    options.sourceId ||
                    '',
                },

                ...(Platform.OS ===
                'android'
                  ? {
                      channelId:
                        'reminders',
                    }
                  : {}),
              },

              trigger: {
                type:
                  Notifications
                    .SchedulableTriggerInputTypes
                    .DATE,

                date,
              },
            }
          );

        ids.push(id);
      }

      date = addRepeat(
        date,
        options.value,
        options.unit
      );
    }

    return ids;
  } catch (error) {
    console.log(
      'scheduleCustomNotifications error:',
      error
    );

    return [];
  }
}

/*
 * ---------------------------------------------------------
 * SCHEDULE + SAVE NOTIFICATION
 * ---------------------------------------------------------
 */

export async function scheduleAndSaveNotification(
  options: {
    title: string;
    body?: string;
    date: Date;
    reminderMinutes?: number;
    repeat?: RepeatType;
    type?: NotificationType;
    emailReminder?: boolean;
    sourceId?: string;
    customRepeatValue?: number;
    customRepeatUnit?: string;
  }
): Promise<string | null> {
  try {
    const minutes =
      options.reminderMinutes || 0;

    const notificationDate =
      new Date(
        options.date.getTime() -
          minutes * 60 * 1000
      );

    if (
      Number.isNaN(
        notificationDate.getTime()
      )
    ) {
      return null;
    }

    if (
      notificationDate.getTime() <=
      Date.now()
    ) {
      return null;
    }

    let localNotificationId:
      | string
      | null = null;

    /*
     * CUSTOM REPEAT
     */

    if (
      options.repeat === 'Custom' &&
      options.customRepeatValue &&
      options.customRepeatValue > 0 &&
      options.customRepeatUnit
    ) {
      const ids =
        await scheduleCustomNotifications(
          {
            title:
              `Reminder: ${options.title}`,

            body:
              options.body,

            firstDate:
              notificationDate,

            value:
              options.customRepeatValue,

            unit:
              options.customRepeatUnit,

            type:
              options.type ||
              'General',

            sourceId:
              options.sourceId ||
              '',
          }
        );

      localNotificationId =
        ids[0] || null;
    }

    /*
     * NORMAL / DAILY / WEEKLY / MONTHLY
     */

    else {
      localNotificationId =
        await scheduleLocalNotification(
          {
            title:
              `Reminder: ${options.title}`,

            body:
              options.body,

            date:
              notificationDate,

            repeat:
              options.repeat,

            type:
              options.type ||
              'General',

            sourceId:
              options.sourceId ||
              '',
          }
        );
    }

    /*
     * SAVE TO BACKEND
     */

    const email =
      await getRegisteredEmail();

    await saveNotificationToBackend(
      {
        title:
          options.title,

        message:
          options.body || '',

        type:
          options.type ||
          'General',

        scheduledAt:
          notificationDate.toISOString(),

        reminderMinutes:
          minutes,

        repeat:
          options.repeat ||
          'None',

        customRepeatValue:
          options.customRepeatValue ||
          null,

        customRepeatUnit:
          options.customRepeatUnit ||
          null,

        email,

        emailReminder:
          Boolean(
            options.emailReminder &&
              email
          ),

        localNotificationId:
          localNotificationId ||
          '',

        sourceId:
          options.sourceId ||
          '',

        status:
          'Pending',
      }
    );

    return localNotificationId;
  } catch (error) {
    console.log(
      'scheduleAndSaveNotification error:',
      error
    );

    return null;
  }
}

/*
 * ---------------------------------------------------------
 * NOTIFICATION TAP HANDLER
 * ---------------------------------------------------------
 *
 * Used for Task notifications.
 *
 * When user taps a Task notification:
 * taskId/sourceId is returned.
 *
 * The Tasks page can then mark that task
 * as completed.
 * ---------------------------------------------------------
 */

export function registerNotificationResponseHandler(
  onTaskNotification?: (
    taskId: string
  ) => void
) {
  const subscription =
    Notifications.addNotificationResponseReceivedListener(
      response => {
        try {
          const data =
            response.notification
              .request
              .content
              .data as {
              type?: string;
              sourceId?: string;
            };

          if (
            data?.type ===
              'Task' &&
            data?.sourceId &&
            onTaskNotification
          ) {
            onTaskNotification(
              String(
                data.sourceId
              )
            );
          }
        } catch (error) {
          console.log(
            'Notification response error:',
            error
          );
        }
      }
    );

  return () => {
    subscription.remove();
  };
}