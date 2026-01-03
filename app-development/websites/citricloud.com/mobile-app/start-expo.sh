#!/bin/bash
set -e
cd /home/ubuntu/infrastructure/cloud/app-development/websites/citricloud.com/mobile-app
# Start Expo dev server on specific IP and port
export REACT_NATIVE_PACKAGER_HOSTNAME=57.129.74.173
npm run start -- --clear &
echo "Expo dev server starting on 57.129.74.173:8081. Check terminal for QR."
wait
