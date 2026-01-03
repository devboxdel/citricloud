#!/bin/bash
# Start Expo in a detached screen session
cd /home/ubuntu/infrastructure/cloud/app-development/websites/citricloud.com/mobile-app
export REACT_NATIVE_PACKAGER_HOSTNAME=57.129.74.173

# Kill existing expo screen session if it exists
screen -S expo -X quit 2>/dev/null || true

# Start new screen session named 'expo'
screen -dmS expo bash -c "npm run start -- --clear; exec bash"

echo "Expo server started in detached screen session 'expo'"
echo "To view output: screen -r expo"
echo "To detach from screen: Press Ctrl+A then D"
echo "To stop server: screen -S expo -X quit"
