#!/usr/bin/env bash
# Builds the signed Muvance Meet Android app inside Docker, so no Java or Android tools are needed
# locally. See README.md. Run from anywhere: bash apps/meet-app/build-apk.sh
set -euo pipefail

APP="$(cd "$(dirname "$0")" && pwd)"
REPO="$(cd "$APP/../.." && pwd)"
# The same signing key as the CRM app. Losing it means phones can't update the app, only reinstall it.
KEYSTORE="${MUVANCE_KEYSTORE_FILE:-$HOME/muvance-android.keystore}"
SECRET="${MUVANCE_KEYSTORE_SECRET_FILE:-$HOME/muvance-android.secret}"
IMAGE=ghcr.io/cirruslabs/android-sdk:36
OUT="${MUVANCE_APK_OUT:-$HOME/muvance-meet.apk}"

[ -f "$KEYSTORE" ] && [ -f "$SECRET" ] || { echo "Missing keystore or its password file." >&2; exit 1; }

# Generated files (web assets, plugin list) that stay out of git.
(cd "$APP" && npx cap sync android)

# Docker on Windows needs Windows-style paths.
to_host() { if command -v cygpath >/dev/null; then cygpath -m "$1"; else echo "$1"; fi; }

MSYS_NO_PATHCONV=1 docker run --rm \
  -v "$(to_host "$REPO"):/repo" \
  -v "$(to_host "$KEYSTORE"):/signing/release.keystore:ro" \
  -v muvance-gradle-cache:/root/.gradle \
  -e MUVANCE_KEYSTORE=/signing/release.keystore \
  -e MUVANCE_KEYSTORE_PASSWORD="$(cat "$SECRET")" \
  -w /repo/apps/meet-app/android \
  "$IMAGE" \
  sh gradlew --no-daemon assembleRelease

cp "$APP/android/app/build/outputs/apk/release/app-release.apk" "$OUT"
# The public download, once committed: https://meet.muvance.com/downloads/muvance-meet.apk
mkdir -p "$REPO/apps/meet/public/downloads"
cp "$OUT" "$REPO/apps/meet/public/downloads/muvance-meet.apk"
echo "Built: $OUT"
