# Production Deployment

## Files

- `docker-compose.yml` - production stack
- `Caddyfile` - external reverse proxy and HTTPS termination
- `.env.backend.example` - backend environment template
- `.env.frontend.example` - frontend environment template
- `.env.caddy.example` - caddy domain and ACME email template
- `start.sh` - local production-like start with image build
- `deploy.sh` - deploy using prebuilt images
- `stop.sh` - stop stack
- `clean.sh` - remove stack and volumes

## Server bootstrap

```bash
sudo mkdir -p /opt/project-crm
cd /opt/project-crm
git clone <your-repo-url> .
cp environments/prod/.env.backend.example environments/prod/.env.backend
cp environments/prod/.env.frontend.example environments/prod/.env.frontend
cp environments/prod/.env.caddy.example environments/prod/.env.caddy
chmod +x environments/prod/*.sh
```

Fill in secrets in `.env.backend` and the real domain/email in `.env.caddy`.
If one of the `.env.*` files is missing later, prod scripts recreate it from the matching `.example` and stop with an instruction to review the placeholders.

## Manual first deploy

```bash
cd /opt/project-crm/environments/prod
./start.sh
```

## Image-based deploy

```bash
cd /opt/project-crm
git pull --ff-only
cd environments/prod
IMAGE_TAG=<tag> ./deploy.sh
```

## Notes

- external `caddy` listens on `80/443`, terminates HTTPS and proxies traffic inside docker network
- frontend is not exposed directly to the host anymore
- `/api` requests are proxied to the backend container by the external `caddy`
- migrations are executed before app startup
- `DEV_SEED_ENABLED` is disabled in production
- `start.sh`, `deploy.sh` and `migrate.sh` load `.env.backend`, `.env.frontend` and `.env.caddy` automatically through `load-env.sh`
- if any `.env.*` file is missing, the script restores it from `.example` and exits before deploy continues
