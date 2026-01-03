# Expo Dev Server (Expo Go)

## Start

```bash
cd mobile-app
npm install
npm run start -- --tunnel --clear
```

- Scan the QR shown in the terminal with Expo Go (Android) or the iOS Camera.
- Tunnel mode works across networks; use `--lan` if your phone is on the same LAN.

## Ports

- Default Expo dev uses 19000/19001/19002; tunnel avoids needing port exposes.
- If using `--lan`, ensure these ports are open on the host.

## Helper Script

```bash
./mobile-app/start-expo.sh
```
Starts the server in tunnel mode and prints a status message.

## Troubleshooting

- If prompted to install `@expo/ngrok` globally, run:
  ```bash
  sudo npm install -g @expo/ngrok@^4.1.0
  ```
- Clear cache if bundling stalls: add `--clear` or delete `.expo/`.
- Keep package versions aligned: run `npm outdated` and update to Expo’s expected versions.
