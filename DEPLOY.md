# Deploying Muvance

Production runs as Docker containers on a VPS that Muvance has to itself. Caddy owns ports 80/443,
gets HTTPS certificates for every domain automatically, and passes each one to its container:

| Container  | What it serves                                                       |
| ---------- | -------------------------------------------------------------------- |
| `caddy`    | HTTPS, routes each domain to its container, and `/api/*` to the API  |
| `web`      | The public website (`muvance.com`)                                   |
| `admin`    | The CRM (`admin.muvance.com`)                                        |
| `meet`     | Video meetings (`meet.muvance.com`)                                  |
| `chat`     | Muvance Chat, team and client conversations (`chat.muvance.com`)     |
| `accounts` | Muvance Account: sign-in, password and apps (`accounts.muvance.com`) |
| `livekit`  | The media server behind meetings (audio, video, screens)             |
| `api`      | Node.js API (bookings, auth, CRM, meetings), talks to MongoDB        |

The database is **MongoDB Atlas** (managed, backed up), not a container on the VPS.

Every push to `main` runs **CI** (format, lint, typecheck, tests against MongoDB, build, Docker builds).
If it passes, **Release** builds the images, pushes them to GitHub Container Registry tagged with the
commit (`sha-<commit>`), copies `compose.production.yml`, `Caddyfile`, `deploy/deploy.sh` and
`deploy/livekit.yaml` to the VPS and runs the deploy. The deploy waits for every container's health
check; **if the new version isn't healthy, it rolls back to the previous one automatically**. A smoke
test then checks all three sites.

---

## 1. One-time setup

### MongoDB Atlas

1. Create a cluster (an M0 free tier is fine to start; M10+ adds continuous backups).
2. Create a database user and copy the connection string (Connect → Drivers).
3. Network Access → allow the VPS's public IP.

### VPS

Ubuntu 24.04 with 2 vCPU and 4 GB RAM is plenty (video calls of 5 people are light for LiveKit).

1. Point DNS **A records** for `muvance.com`, `www.muvance.com`, `admin.muvance.com`,
   `meet.muvance.com`, `mail.muvance.com`, `chat.muvance.com` and `accounts.muvance.com` to the VPS
   IP.
2. Install Docker and allow SSH through the firewall:

   ```sh
   curl -fsSL https://get.docker.com | sudo sh
   sudo ufw allow OpenSSH && sudo ufw enable
   ```

   The stack publishes ports 80 and 443 (websites, TCP and UDP), 7881/tcp and 7882/udp (meeting audio
   and video). Docker opens its published ports itself, bypassing `ufw`; if your provider has its own
   firewall in its control panel, allow those ports there.

3. Create a deploy user that can run Docker, and the deploy folder:

   ```sh
   sudo adduser --disabled-password deploy
   sudo usermod -aG docker deploy
   sudo mkdir -p /opt/muvance/runtime && sudo chown -R deploy:deploy /opt/muvance
   ```

4. Create an SSH key pair for GitHub Actions (on your machine), and install the public key for `deploy`:

   ```sh
   ssh-keygen -t ed25519 -f muvance-deploy -C "github-actions" -N ""
   # Add muvance-deploy.pub to /home/deploy/.ssh/authorized_keys on the VPS
   ssh-keyscan -t ed25519 YOUR_VPS_IP   # this line is VPS_KNOWN_HOSTS below
   ```

5. Create the two config files from the examples in `deploy/` and fill them in:

   ```sh
   scp deploy/production.env.example deploy@YOUR_VPS_IP:/opt/muvance/.env.production
   scp deploy/api.env.example        deploy@YOUR_VPS_IP:/opt/muvance/runtime/api.env
   # then edit both on the VPS (domains, IMAGE_PREFIX, MongoDB URI)
   ```

### GitHub repository

Settings → Secrets and variables → Actions.

**Variables**

| Name           | Example             |
| -------------- | ------------------- |
| `SITE_DOMAIN`  | `muvance.com`       |
| `ADMIN_DOMAIN` | `admin.muvance.com` |
| `DEPLOY_PATH`  | `/opt/muvance`      |

**Secrets**

| Name              | Value                                                                                |
| ----------------- | ------------------------------------------------------------------------------------ |
| `VPS_HOST`        | VPS IP or hostname                                                                   |
| `VPS_USER`        | `deploy`                                                                             |
| `VPS_SSH_KEY`     | Contents of the private key `muvance-deploy`                                         |
| `VPS_KNOWN_HOSTS` | The `ssh-keyscan` line from above                                                    |
| `GHCR_READ_USER`  | Your GitHub username                                                                 |
| `GHCR_READ_TOKEN` | A classic personal access token with only `read:packages` (lets the VPS pull images) |

Optional: Settings → Environments → `production` → add yourself as a required reviewer to approve each deploy.

## 2. First deploy

Push to `main` (or run **Release** manually from the Actions tab). When it finishes, create your
owner account. This prints a one-time sign-up link (valid 7 days):

```sh
ssh deploy@YOUR_VPS_IP
cd /opt/muvance
docker compose --env-file .env.production -f compose.production.yml exec api \
  node dist/create-owner.js --email you@example.com
```

Open the link, set your name and password, and you're in. Invite teammates from **Team** in the admin.

Prefer signing in with a **username** (no email needed)? Create the account directly instead; it asks
for the password, so it never lands in your shell history:

```sh
docker compose --env-file .env.production -f compose.production.yml exec -it api   node dist/create-user.js --username alvi --name "Alvi" --role owner
```

Anyone can add or change a username later under **Settings**, and sign in with either.

## Muvance accounts (accounts.muvance.com)

Everyone on the team has **one Muvance account**: their @muvance.com address and one password, for
every app they're allowed: the Admin CRM, Mail, Chat and Meet. Signing in on any of them signs you in
on all of them (one cookie for the whole domain, `COOKIE_DOMAIN`), like a Google account.

- **Admins manage people** in the Admin CRM's **People** page: add someone (name, username = their
  address, which apps, their Admin CRM role), switch apps on or off, disable them (signs them out of
  everything, mail included), or make a password link.
- **Mail** switched on makes their mailbox; switched off removes it from the mail server (the mail
  already there stays on disk). The mailbox always has the account's password, so phone mail apps
  use the same one.
- **Passwords:** new people get a link to choose theirs (or a starting password they must change).
  Changing it at accounts.muvance.com changes it everywhere.
- **Signing in:** username (`alvi`), address (`alvi@muvance.com`) or, for older accounts, the email
  they used before. Clients (chat guests) sign in without a password: Google, or a code by email.
- **From before:** on start, the API joins each mailbox to the admin user with the same address or
  username, or makes it an account of its own (Mail, Chat and Meet). Each person's first sign-in with
  either old password makes it their one password. An older account still on an outside email can be
  given its address on the People page ("Give address"), which merges the mailbox's account into it.

## Meetings (meet.muvance.com)

Nothing extra to set up beyond the DNS record and ports above: the first deploy creates LiveKit's key
and secret in `/opt/muvance/runtime/livekit.env` (keep it; deleting it makes new ones, which is
harmless). LiveKit's settings are in `deploy/livekit.yaml` (5 people per call, the media ports).

Browsers reach LiveKit two ways: its signalling (a WebSocket) at `https://meet.muvance.com/rtc`
through Caddy, and audio and video directly on ports 7881/tcp and 7882/udp. If calls connect but nobody
sees or hears each other, those ports are blocked. Very strict networks that allow only web traffic
(port 443) can't join; that would need a separate TURN server.

### Call recordings

A host starts recording from ⋮ → **Record this call**. LiveKit's recorder (the `egress` container) opens
the call in a hidden Chrome and saves it as an MP4 in `/opt/muvance/call-recordings`; the admin's
**Call recordings** page plays and downloads them. `redis` connects LiveKit and the recorder.

- Disk: about 200 MB per 30-minute call. Recording refuses to start below 5 GB free
  (`CALL_RECORDINGS_MIN_FREE_GB`), and recordings older than 180 days are deleted
  (`CALL_RECORDINGS_RETENTION_DAYS`; both can go in `runtime/api.env`).
- CPU: a recording uses about 2 cores, so this server records one or two calls at a time.
- `deploy.sh` writes the recorder's settings (`runtime/egress.yaml`) from `runtime/livekit.env`.
- Back up `/opt/muvance/call-recordings` if the recordings matter; they're only on this server.

## Chat (chat.muvance.com)

Muvance Chat (`apps/chat`, API module `apps/api/src/modules/chat`) is a Google Chat-style app for
the team and clients: spaces (group conversations), direct messages, threads, reactions, files,
@mentions and search.

- **Clients (guests)** never have a password. The sign-in page is for them first: **Continue with
  Google**, or their email and a 6-digit code emailed to them (the email also has a one-click
  link). Anyone can sign in: someone nobody invited gets a conversation of their own with the
  whole team. They're invited by email from a space's members list;
  the invite comes from the teammate's own address and its link signs them straight in. Guests only
  see the spaces they're in, and the people in them. Teammates manage guests in Settings → Guests
  (send a sign-in link another way, remove access).
- **Team** members use "Muvance team member? Sign in here" (their Muvance account). The page
  remembers it on their computer.
- **Code emails** come from `no-reply@<domain>` through the relay (Brevo): deploy.sh copies
  `RELAY_USER`/`RELAY_PASSWORD` from `runtime/mail.env` to `runtime/relay.env`. Without it they're
  sent from the inviting teammate's address.
- **Continue with Google** appears once the GitHub repository variable `GOOGLE_CLIENT_ID` is set (the
  release writes it to `runtime/google.env`). Make it in Google Cloud Console → APIs & Services →
  Credentials → Create credentials → OAuth client ID → Web application, with **Authorized
  JavaScript origins** `https://chat.muvance.com`. The OAuth consent screen needs only the default
  scopes (email, profile) and should be **In production** (published) so any client can use it.
- **Live updates** use Server-Sent Events (`/api/chat/events`), held in the API's memory (one API
  process).
- **Email alerts:** a guest with messages from the team still unread after 10 minutes
  (`CHAT_EMAIL_ALERT_MINUTES`) gets one email, from the teammate who wrote, and no more until they
  open chat again.
- **Files** (photos, videos, voice messages and other files, 100 MB each) are stored in
  `/opt/muvance/chat-files`. Files attached but never sent are deleted after a day. Back the folder
  up if the files matter. Everything else (messages, pins, saved messages, statuses) is in MongoDB.
- **Push notifications** use standard Web Push. The API makes its keys on first use and keeps them
  in MongoDB (`chatConfig`), so there's nothing to set up. Each browser or phone that turns
  notifications on is in `chatPushSubscriptions`.
- **Link previews:** the API fetches the first link in a message (never a private address) and
  keeps previews for a week.
- **Android app** (`apps/chat-app`): opens the site full screen; Android trusts it through
  `apps/chat/public/.well-known/assetlinks.json`. Download at `/downloads/muvance-chat.apk`.
- **DNS:** A `chat` → server IP. Caddy gets the certificate on its own once the record exists.

## Team email (mail.muvance.com)

Mailboxes are created in the admin (**Email**, owners and admins). The API writes the mail server's
accounts, aliases and quotas files into `/opt/muvance/mail/config`; docker-mailserver notices within
seconds. People read mail at **mail.muvance.com** (Muvance Mail, `apps/mail`) or in any mail app (IMAP 993, SMTP 465).

| Container    | What it does                                                                      |
| ------------ | --------------------------------------------------------------------------------- |
| `mailserver` | docker-mailserver: receives mail (25), IMAP (993), sending (465/587), spam filter |
| `mailweb`    | Muvance Mail, the webmail app; reads and sends through the API (IMAP/SMTP)        |

- **Sending** goes through Brevo's relay (`smtp-relay.brevo.com:587`): this server's port 25 can't
  send out, and Brevo's addresses are trusted by Gmail and Outlook. Its login lives in
  `/opt/muvance/runtime/mail.env` (`RELAY_USER=...`, `RELAY_PASSWORD=...`), only on the server.
- **TLS** for IMAP/SMTP reuses Caddy's certificate for mail.muvance.com.
- **Webmail sessions** keep the person's mail password encrypted with `WEBMAIL_SECRET`
  (`runtime/webmail.env`, made by `deploy.sh`), so the API can open their mailbox.
- **Switch-on:** `deploy.sh` starts the mail server only when `runtime/mail.env` exists, Caddy has
  the mail.muvance.com certificate (needs its DNS record) and at least one mailbox exists. It prints
  why email is off otherwise. After those are in place, run `sh deploy.sh $(cat .deployed-tag)`.
- **DKIM** (once, after the first start):
  `docker compose --env-file .env.production -f compose.production.yml exec mailserver setup config dkim domain muvance.com`,
  then publish the TXT record it prints (`mail._domainkey`).
- **DNS:** A `mail` → server IP; MX `@` → `mail.muvance.com` (10); SPF
  `v=spf1 mx include:spf.brevo.com ~all`; DKIM `mail._domainkey`; DMARC
  `_dmarc` → `v=DMARC1; p=quarantine; rua=mailto:dmarc@muvance.com`; reverse DNS (in Contabo) of the
  server IP → `mail.muvance.com`.
- **Deleting a mailbox** stops it receiving and signing in; its stored mail stays in `mail/data`.
- Back up `/opt/muvance/mail` (mail and settings) if the mail matters.

## Moving from the shared Qravy server

Muvance used to run on Qravy's VPS behind Qravy's Caddy. To move it without downtime:

1. **Lower the TTL** of Muvance's DNS records to 5 minutes, a day ahead, so the switch is quick.
2. **Set up the new VPS** (section 1, steps 2 and 3). Install the existing deploy key's public half
   (`muvance-deploy.pub`) for `deploy`, so the `VPS_SSH_KEY` secret stays the same.
3. **Copy the config files straight from the old server to the new one** (they hold the database
   password and Meta token, so never paste them into a chat or the repo). On the old server:

   ```sh
   scp /opt/muvance/.env.production deploy@NEW_IP:/opt/muvance/
   scp /opt/muvance/runtime/api.env deploy@NEW_IP:/opt/muvance/runtime/
   ```

4. **MongoDB Atlas:** Network Access → add the new IP (keep the old one until the move is done).
5. **GitHub secrets:** set `VPS_HOST` to the new IP and `VPS_KNOWN_HOSTS` to its `ssh-keyscan` line.
6. **Deploy:** run **Release** from the Actions tab. The containers start, but the smoke test fails
   because DNS still points at the old server; that's expected.
7. **Switch DNS:** point all four A records at the new IP. Within a few minutes Caddy gets the
   certificates (it keeps retrying until DNS points at it). Re-run **Release** to see the smoke test pass.
8. **Clean up the old server** once the sites load from the new one: stop Muvance there
   (`cd /opt/muvance && docker compose --env-file .env.production -f compose.production.yml down`),
   remove the Muvance block from Qravy's `Caddyfile` (in the Qravy repo, on `main`), and remove the
   old IP from Atlas.

## Day to day

- **Deploy:** push to `main`. That's it.
- **Status:** `docker compose --env-file .env.production -f compose.production.yml ps`
- **Logs:** `docker compose --env-file .env.production -f compose.production.yml logs -f api caddy`
- **Roll back manually:** `sh deploy.sh sha-<older-commit>` in `/opt/muvance` (any previously pushed tag).
- **Locked out?** Run `create-owner` (new email) or `create-user` (new username), or ask another owner for a reset link.

## Security notes

- Only Caddy (80/443) and LiveKit's media ports (7881, 7882) are reachable from the internet; the API,
  apps and LiveKit's control port are only on Docker's private network.
- Admin sessions are `HttpOnly`, `Secure`, `SameSite=Strict` cookies; sessions are stored (hashed) in
  MongoDB, so disabling a teammate or changing a password signs them out everywhere.
- Logins and public bookings are rate-limited; all inputs are validated on the server.
- The admin domain sends `X-Robots-Tag: noindex` so it never appears in search results.
