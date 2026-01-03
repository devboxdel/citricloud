# CitriCloud Mobile

A lightweight Expo/React Native companion app for CitriCloud. It lives in this separate `mobile-app` folder so the existing `frontend` web app stays unchanged.

## What you get
- Bottom tab app with Home, Services, Workspace, Status, and Account screens
- CitriCloud-themed cards, quick actions, and status highlights
- Placeholder actions for workspace, chat, and ticket flows (wire in APIs when ready)

## Run it locally
1. `cd mobile-app`
2. `npm install`
3. `npm run start`
4. Open the QR code in Expo Go (iOS/Android) or press `a`/`i`/`w` to launch the emulator/web preview.

## Customizing
- Update brand colors in `src/theme/colors.ts`.
- Adjust screen copy or add real data/API calls in `src/screens` and `src/constants/data.ts`.
- When you add auth, reuse your existing CitriCloud OAuth/JWT flow and store tokens with `expo-secure-store`.
