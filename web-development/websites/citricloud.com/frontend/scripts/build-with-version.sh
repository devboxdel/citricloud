#!/bin/bash

# Get current git commit hash (short version)
COMMIT_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

# Export as environment variable for Vite
export VITE_COMMIT_HASH=$COMMIT_HASH

echo "Building with commit hash: $COMMIT_HASH"

# Run the build
npm run build
