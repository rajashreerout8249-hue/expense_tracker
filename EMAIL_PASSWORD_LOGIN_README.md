# Email + Password Login update

This update is based on the uploaded `expense-tracker-2.zip` and preserves the other project files/features.

## What changed
- Replaced phone/OTP login with email/password login in `app/login.tsx`.
- Added `app/register.tsx` for account creation.
- Updated `src/api/authApi.ts` to store the returned session token and basic user details.
- Added MongoDB `User` model and `/api/auth/register` and `/api/auth/login` backend routes.
- Removed the obsolete OTP screen and OTP model from this copy.

## Run
From the project root:
```bash
npm install
```
In a separate terminal:
```bash
cd backend
npm install
npm start
```
Then in the project root terminal:
```bash
npx expo start -c
```

The backend defaults to `http://192.168.29.21:5000` as in the existing project. This only works on your own LAN; for a shared APK, deploy the backend to an HTTPS host and set `EXPO_PUBLIC_API_URL` to that HTTPS URL before building. Keep `.env` secrets private.

Security note: passwords are stored as scrypt hashes, not plaintext. The session token in this example is a random token; proper production-grade sessions/JWT and authorization middleware for user-specific data should be implemented before public release. Existing transaction routes may not yet isolate data per user.
