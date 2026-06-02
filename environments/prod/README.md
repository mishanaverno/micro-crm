# Production Deployment

## Files

- `docker-compose.yml` - production stack
- `Caddyfile` - external reverse proxy and HTTPS termination
- `.env.backend.example` - backend environment template
- `.env.frontend.example` - frontend environment template
- `.env.caddy.example` - caddy domains and ACME email template
- `start.sh` - local production-like start with image build
- `deploy.sh` - deploy using prebuilt images
- `stop.sh` - stop stack
- `clean.sh` - remove stack and volumes

## Server bootstrap

```bash
sudo mkdir -p /opt/project-crm
cd /opt/project-crm
git clone <your-repo-url> .
chmod +x environments/prod/*.sh
```

For CI/CD deploy, production `.env.*` files are generated on the server by `.github/workflows/deploy.yml` from GitHub Variables and GitHub Secrets.
The `.example` files stay in the repo as templates for manual bootstrap and documentation.

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

Before the first CI/CD deploy, configure these GitHub Variables:

- `PROD_DATABASE_HOST`
- `PROD_DATABASE_PORT`
- `PROD_DATABASE_USER`
- `PROD_DATABASE_NAME`
- `PROD_NODE_ENV`
- `PROD_PORT`
- `PROD_JWT_ACCESS_EXPIRES_IN`
- `PROD_JWT_REFRESH_EXPIRES_IN`
- `PROD_CORS_ORIGIN`
- `PROD_VITE_API_BASE_URL`
- `PROD_LANDING_DOMAIN`
- `PROD_APP_DOMAIN`
- `PROD_API_DOMAIN`
- `PROD_ACME_EMAIL`

Configure these GitHub Secrets:

- `SSH_HOST`
- `SSH_PORT`
- `SSH_USER`
- `SSH_PRIVATE_KEY`
- `GHCR_READ_TOKEN`
- `PROD_DATABASE_PASSWORD`
- `PROD_JWT_ACCESS_SECRET`
- `PROD_JWT_REFRESH_SECRET`

## Notes

- external `caddy` listens on `80/443`, terminates HTTPS and proxies traffic inside docker network
- landing is served on the root domain, frontend on the app subdomain, backend on the api subdomain
- migrations are executed before app startup
- `DEV_SEED_ENABLED` is disabled in production
- `start.sh`, `deploy.sh` and `migrate.sh` load `.env.backend`, `.env.frontend` and `.env.caddy` automatically through `load-env.sh`
- production deploy no longer depends on manually created `.env.*` files on the server
