# Expense Tracker Mobile

Frontend-only Expense Tracker built with Expo Router and React Native.

## Current SDK

- Expo SDK 57
- React Native 0.86.3
- React 19.2.3
- Expo Router 57
- Local transaction storage with AsyncStorage

## Run the app

Use Node.js 22.13+.

```bash
npm install
npx expo start --clear
```

Then open the project with Expo Go SDK 57 and scan the QR code.

## Android APK

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build -p android --profile preview
```

The `preview` profile is configured to create an installable APK.

## Important

If dependencies show version warnings after `npm install`, run:

```bash
npx expo install --fix
npx expo start --clear
```

## Notification & Reminder Setup

1. Install frontend dependencies: `npm install`
2. Start the backend from `backend`: `npm install` then `npm run dev`.
3. Copy `.env.example` to `.env` and replace `EXPO_PUBLIC_API_URL` with the PC IPv4 address when testing on a physical phone.
4. The app requests notification permission on first launch and creates an Android `reminders` notification channel.
5. Use Profile -> Notifications to create reminders, tasks, events, payments, or important notes with date/time, 10-minute/1-hour/1-day offsets, repeat options, custom repeat, email reminder, complete and snooze actions.
6. For email reminders, configure `backend/.env` from `backend/.env.example` with SMTP credentials. Gmail requires an App Password rather than the normal account password.
7. MongoDB stores notification records in the `notifications` collection after the first notification is created.

Local mobile notifications are scheduled on the device, so they can appear while the app is in the background. Email delivery requires the backend process to remain running (or be deployed to a server for production).


## Phone OTP Login
The app now opens with Phone Number -> OTP -> Expense Tracker.
For development, if Twilio is not configured, the backend returns the OTP and prints it in the backend terminal.
For real SMS, install `twilio` in `backend` and set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PHONE_NUMBER` in `backend/.env`.
