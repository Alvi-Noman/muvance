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

# Call recordings: the recorder's settings (with LiveKit's key), and the folder for the videos.
# The recorder and the API run as different users, so both may write there.
LK_KEY="$(sed -n 's/^LIVEKIT_API_KEY=//p' runtime/livekit.env)"
LK_SECRET="$(sed -n 's/^LIVEKIT_API_SECRET=//p' runtime/livekit.env)"
(
  umask 077
  cat > runtime/egress.yaml <<EGRESS
log_level: info
api_key: $LK_KEY
api_secret: $LK_SECRET
ws_url: ws://127.0.0.1:7880
redis:
  address: 127.0.0.1:6379
health_port: 9090
cpu_cost:
  room_composite_cpu_cost: 2
EGRESS
)
chmod 644 runtime/egress.yaml
mkdir -p call-recordings && chmod 777 call-recordings

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
