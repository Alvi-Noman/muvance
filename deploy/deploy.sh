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
# A recording stops (and is saved) after 3 hours or 3 GB, whichever comes first.
session_limits:
  file_output_max_duration: 3h
  file_output_max_size: 3221225472
EGRESS
)
chmod 644 runtime/egress.yaml
mkdir -p call-recordings && chmod 777 call-recordings

# Team email. The API (its own user) writes the accounts files into mail/config; webmail (www-data)
# keeps its small database in mail/webmail-db.
mkdir -p mail/data mail/state mail/logs mail/config mail/webmail-db roundcube
chmod 777 mail/config mail/webmail-db
# Never ban webmail or the API for failed sign-ins: they connect from Docker's private addresses.
printf '[DEFAULT]\nignoreip = 127.0.0.1/8 10.0.0.0/8 172.16.0.0/12 192.168.0.0/16\n' > mail/config/fail2ban-jail.cf
# Webmail's secret key, made once and kept.
if [ ! -f runtime/roundcube-secret.php ]; then
  DES_KEY="$(head -c 18 /dev/urandom | base64 | tr -d '\n/+=' | cut -c1-24)"
  printf "<?php\n\$config['des_key'] = '%s';\n" "$DES_KEY" > runtime/roundcube-secret.php
  chmod 644 runtime/roundcube-secret.php
fi

# Start email only once it's set up, so a deploy can never fail on it: the relay's login
# (runtime/mail.env), Caddy's certificate for mail.<domain> (needs the DNS record), and a mailbox.
SITE_DOMAIN="$(sed -n 's/^SITE_DOMAIN=//p' .env.production)"
MAIL_CERT="/data/caddy/certificates/acme-v02.api.letsencrypt.org-directory/mail.$SITE_DOMAIN/mail.$SITE_DOMAIN.crt"
if [ ! -f runtime/mail.env ]; then
  echo "Email: not started (runtime/mail.env with RELAY_USER and RELAY_PASSWORD is missing)"
elif ! $COMPOSE exec -T caddy test -f "$MAIL_CERT" 2> /dev/null; then
  echo "Email: not started (no certificate for mail.$SITE_DOMAIN yet; check its DNS record)"
elif [ "$(cat mail/config/mailbox-count 2> /dev/null || echo 0)" -lt 1 ]; then
  echo "Email: not started (create a mailbox in the admin first)"
else
  COMPOSE="$COMPOSE --profile mail"
  echo "Email: on"
fi

IMAGE_TAG="$TAG" $COMPOSE pull

if IMAGE_TAG="$TAG" $COMPOSE up -d --remove-orphans --wait --wait-timeout 180; then
  # Pick up Caddyfile changes without downtime.
  $COMPOSE exec -T caddy caddy reload --config /etc/caddy/Caddyfile || $COMPOSE restart caddy
  # LiveKit and the recorder only read their settings files at start: restart them when those
  # change (this briefly drops any call in progress, so only then).
  MEDIA_CONFIG="$(cat livekit.yaml runtime/egress.yaml | cksum)"
  if [ "$MEDIA_CONFIG" != "$(cat .media-config 2>/dev/null || true)" ]; then
    $COMPOSE restart livekit egress
    echo "$MEDIA_CONFIG" > .media-config
  fi
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
