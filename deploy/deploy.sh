#!/bin/sh
# Runs on the VPS (uploaded by the Release workflow). Usage: sh deploy.sh sha-<commit>
# Pulls the given images, starts them, waits for health checks and rolls back if they fail.
set -eu

TAG="${1:?usage: deploy.sh <image-tag>}"
cd "$(dirname "$0")"
COMPOSE="docker compose --env-file .env.production -f compose.production.yml"
PREVIOUS="$(cat .deployed-tag 2>/dev/null || true)"

echo "Deploying $TAG (previous: ${PREVIOUS:-none})"

# Meetings: LiveKit's API key and secret, made once on this server and kept (never in the repo).
if [ ! -f runtime/livekit.env ]; then
  mkdir -p runtime
  KEY="API$(head -c 8 /dev/urandom | od -An -tx1 | tr -d ' \n')"
  SECRET="$(head -c 32 /dev/urandom | od -An -tx1 | tr -d ' \n')"
  (
    umask 077
    {
      echo "LIVEKIT_API_KEY=$KEY"
      echo "LIVEKIT_API_SECRET=$SECRET"
      echo "LIVEKIT_KEYS=$KEY: $SECRET"
    } > runtime/livekit.env
  )
  echo "Created runtime/livekit.env (LiveKit key and secret)"
fi

IMAGE_TAG="$TAG" $COMPOSE pull

if IMAGE_TAG="$TAG" $COMPOSE up -d --remove-orphans --wait --wait-timeout 180; then
  # Pick up Caddyfile changes without downtime.
  $COMPOSE exec -T caddy caddy reload --config /etc/caddy/Caddyfile || $COMPOSE restart caddy
  echo "$TAG" > .deployed-tag
  docker image prune -f > /dev/null
  echo "Deployed $TAG"
else
  echo "Deploy of $TAG failed its health checks. Recent API logs:" >&2
  $COMPOSE logs --tail 80 api >&2 || true
  if [ -n "$PREVIOUS" ]; then
    echo "Rolling back to $PREVIOUS" >&2
    IMAGE_TAG="$PREVIOUS" $COMPOSE up -d --remove-orphans --wait --wait-timeout 180 || true
  fi
  exit 1
fi
