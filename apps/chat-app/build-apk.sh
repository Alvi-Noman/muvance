#!/usr/bin/env bash
# Builds the signed Muvance Chat Android app inside Docker, so no Java or Android tools are needed
# locally. See README.md. Run from anywhere: bash apps/chat-app/build-apk.sh
set -euo pipefail

APP="$(cd "$(dirname "$0")" && pwd)"
REPO="$(cd "$APP/../.." && pwd)"
# The same signing key as the other Muvance apps. Losing it means phones can't update the app.
KEYSTORE="${MUVANCE_KEYSTORE_FILE:-$HOME/muvance-android.keystore}"
SECRET="${MUVANCE_KEYSTORE_SECRET_FILE:-$HOME/muvance-android.secret}"
IMAGE=ghcr.io/cirruslabs/android-sdk:36
OUT="${MUVANCE_APK_OUT:-$HOME/muvance-chat.apk}"

[ -f "$KEYSTORE" ] && [ -f "$SECRET" ] || { echo "Missing keystore or its password file." >&2; exit 1; }

# Docker on Windows needs Windows-style paths.
to_host() { if command -v cygpath >/dev/null; then cygpath -m "$1"; else echo "$1"; fi; }

MSYS_NO_PATHCONV=1 docker run --rm \
  -v "$(to_host "$REPO"):/repo" \
  -v "$(to_host "$KEYSTORE"):/signing/release.keystore:ro" \
  -v muvance-gradle-cache:/root/.gradle \
  -e MUVANCE_KEYSTORE=/signing/release.keystore \
  -e MUVANCE_KEYSTORE_PASSWORD="$(cat "$SECRET")" \
  -w /repo/apps/chat-app/android \
  "$IMAGE" \
  sh gradlew --no-daemon assembleRelease

cp "$APP/android/app/build/outputs/apk/release/app-release.apk" "$OUT"
# The public download, once committed: https://chat.muvance.com/downloads/muvance-chat.apk
mkdir -p "$REPO/apps/chat/public/downloads"
cp "$OUT" "$REPO/apps/chat/public/downloads/muvance-chat.apk"
echo "Built: $OUT"
