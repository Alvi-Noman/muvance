# Deploying Muvance

Production runs as four Docker containers on the same VPS as Qravy. Qravy's Caddy owns ports 80/443
and handles HTTPS, then passes Muvance's domains to Muvance's own Caddy over a private Docker network:

| Container | What it serves                                               |
| --------- | ------------------------------------------------------------ |
| `caddy`   | Routes each domain to its container, and `/api/*` to the API |
| `web`     | The public website (`muvance.com`)                           |
| `admin`   | The CRM (`admin.muvance.com`)                                |
| `api`     | Node.js API (bookings, auth, CRM), talks to MongoDB          |

The database is **MongoDB Atlas** (managed, backed up), not a container on the VPS.

Every push to `main` runs **CI** (format, lint, typecheck, tests against MongoDB, build, Docker builds).
If it passes, **Release** builds the three images, pushes them to GitHub Container Registry tagged with
the commit (`sha-<commit>`), copies `compose.production.yml`, `Caddyfile` and `deploy/deploy.sh` to the
VPS and runs the deploy. The deploy waits for every container's health check; **if the new version
isn't healthy, it rolls back to the previous one automatically**. A smoke test then checks both sites.

---

## 1. One-time setup

### MongoDB Atlas

1. Create a cluster (an M0 free tier is fine to start; M10+ adds continuous backups).
2. Create a database user and copy the connection string (Connect → Drivers).
3. Network Access → allow the VPS's public IP (already there if you reuse Qravy's Atlas project).

### Qravy's Caddy (do this first)

Muvance can't publish ports 80/443 itself, so Qravy must pass its domains along. Qravy's deploy overwrites
its config on the server, so these two changes belong in the **Qravy repo**, on `main`.

On the server, once: `docker network create shared-edge`. Qravy's deploy fails without this network.

Add to Qravy's `Caddyfile`, above the `https://` catch-all:

```caddyfile
# Muvance: separate project on this server (see its DEPLOY.md).
muvance.com, www.muvance.com, admin.muvance.com {
	reverse_proxy muvance-proxy:80
}
```

In Qravy's `compose.production.yml`, attach `caddy` to the network:

```yaml
services:
  caddy:
    # ...existing settings...
    networks:
      - default
      - shared-edge

networks:
  shared-edge:
    external: true
```

Qravy keeps running if Muvance is down: those domains just return a 502.

### VPS (shared with Qravy; Docker and the firewall are already set up)

1. Point DNS **A records** for `muvance.com`, `www.muvance.com` and `admin.muvance.com` to the VPS IP.
2. Create a deploy user that can run Docker, and the deploy folder:

   ```sh
   sudo adduser --disabled-password deploy
   sudo usermod -aG docker deploy
   sudo mkdir -p /opt/muvance/runtime && sudo chown -R deploy:deploy /opt/muvance
   ```

3. Create an SSH key pair for GitHub Actions (on your machine), and install the public key for `deploy`:

   ```sh
   ssh-keygen -t ed25519 -f muvance-deploy -C "github-actions" -N ""
   # Add muvance-deploy.pub to /home/deploy/.ssh/authorized_keys on the VPS
   ssh-keyscan -t ed25519 YOUR_VPS_IP   # this line is VPS_KNOWN_HOSTS below
   ```

4. Create the two config files from the examples in `deploy/` and fill them in:

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

## Day to day

- **Deploy:** push to `main`. That's it.
- **Status:** `docker compose --env-file .env.production -f compose.production.yml ps`
- **Logs:** `docker compose --env-file .env.production -f compose.production.yml logs -f api caddy`
- **Note:** each Qravy deploy restarts Qravy's Caddy, so Muvance also blips for a few seconds.
- **Roll back manually:** `sh deploy.sh sha-<older-commit>` in `/opt/muvance` (any previously pushed tag).
- **Locked out?** Run `create-owner` (new email) or `create-user` (new username), or ask another owner for a reset link.

## Security notes

- Nothing in this stack is published to the internet; only Qravy's Caddy can reach it.
- Admin sessions are `HttpOnly`, `Secure`, `SameSite=Strict` cookies; sessions are stored (hashed) in
  MongoDB, so disabling a teammate or changing a password signs them out everywhere.
- Logins and public bookings are rate-limited; all inputs are validated on the server.
- The admin domain sends `X-Robots-Tag: noindex` so it never appears in search results.
