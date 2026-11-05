#!/usr/bin/env bash
# Builds the signed Android app inside Docker, so no Java or Android tools are needed locally.
# See README.md. Run from anywhere: bash apps/mobile/build-apk.sh
set -euo pipefail

MOBILE="$(cd "$(dirname "$0")" && pwd)"
REPO="$(cd "$MOBILE/../.." && pwd)"
# Kept outside the repo. Losing them means phones can't update the app, only reinstall it.
KEYSTORE="${MUVANCE_KEYSTORE_FILE:-$HOME/muvance-android.keystore}"
SECRET="${MUVANCE_KEYSTORE_SECRET_FILE:-$HOME/muvance-android.secret}"
IMAGE=ghcr.io/cirruslabs/android-sdk:36
OUT="${MUVANCE_APK_OUT:-$HOME/muvance-admin.apk}"

if [ ! -f "$MOBILE/android/app/google-services.json" ]; then
  echo "Missing apps/mobile/android/app/google-services.json (download it from Firebase)." >&2
  exit 1
fi
[ -f "$KEYSTORE" ] && [ -f "$SECRET" ] || { echo "Missing keystore or its password file." >&2; exit 1; }

# Docker on Windows needs Windows-style paths.
to_host() { if command -v cygpath >/dev/null; then cygpath -m "$1"; else echo "$1"; fi; }

MSYS_NO_PATHCONV=1 docker run --rm \
  -v "$(to_host "$REPO"):/repo" \
  -v "$(to_host "$KEYSTORE"):/signing/release.keystore:ro" \
  -v muvance-gradle-cache:/root/.gradle \
  -e MUVANCE_KEYSTORE=/signing/release.keystore \
  -e MUVANCE_KEYSTORE_PASSWORD="$(cat "$SECRET")" \
  -w /repo/apps/mobile/android \
  "$IMAGE" \
  sh gradlew --no-daemon assembleRelease

cp "$MOBILE/android/app/build/outputs/apk/release/app-release.apk" "$OUT"
echo "Built: $OUT"
