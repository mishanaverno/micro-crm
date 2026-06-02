# AGENTS

Рабочая памятка по проекту `project-crm`.

## Общее

- Репозиторий: monorepo с `packages/backend`, `packages/frontend`, `db`, `environments`.
- Основной язык общения по проекту: русский.
- Локальная среда живет в `environments/local`.
- Продовая среда живет в `environments/prod`.

## Локальная среда

- Основной вход: `make up`, `make down`, `make clean`, `make reset`.
- `Makefile` использует `environments/local`.
- В local compose:
  - `postgres` доступен на `5432`
  - `backend` доступен на `3000`
  - `frontend` доступен на `5173`
- Для local используются dev Dockerfile:
  - `packages/backend/Dockerfile.dev`
  - `packages/frontend/Dockerfile.dev`

### Важные детали local compose

- В `environments/local/docker-compose.yml` bind mounts должны идти от корня репо через `../../...`.
- Уже исправленная важная деталь:
  - backend и frontend монтируются из `../../packages/...`
  - migrator монтирует `../../db/...`
- Если снова появится ошибка вида `ENOENT: no such file or directory, open '/app/package.json'`, сначала проверять именно mount paths.

## Миграции и seed

- `init` больше не отдельный файл для запуска.
- Инициализация базы теперь оформлена как первая миграция в `db/migrations`.
- Скрипт миграций: `db/up.sh`.

### Как теперь работает `db/up.sh`

- Больше нет special-case для `/app/init.sql`.
- Скрипт:
  - проверяет, существует ли таблица `migrations`
  - если таблицы еще нет, начинает применять миграции по порядку
  - ожидает, что первая миграция создаст таблицу `migrations`
  - после этого пишет примененный файл в таблицу `migrations`
- Dev seed запускается только если `DEV_SEED_ENABLED=true`.

### Важное правило

- Любые новые изменения схемы должны оформляться только через `db/migrations/*.sql`.
- Не возвращать отдельную фазу `init.sql`.

## Dockerfiles

### Backend

- `packages/backend/Dockerfile.dev`
  - local/dev runtime
  - `npm ci --no-audit --no-fund --verbose`
  - `CMD ["npm", "run", "dev"]`
- `packages/backend/Dockerfile`
  - production multi-stage build
  - build stage: `npm run build`
  - runtime stage: `npm ci --omit=dev --no-audit --no-fund`
  - `CMD ["npm", "run", "start"]`

### Frontend

- `packages/frontend/Dockerfile.dev`
  - local/dev runtime
  - `CMD ["npm", "run", "dev"]`
- `packages/frontend/Dockerfile`
  - production build stage на `node:24-alpine`
  - runtime stage на `caddy:2.9-alpine`
  - принимает `ARG VITE_API_BASE_URL=/api`

## Frontend runtime в production

- Frontend production image сам по себе тоже использует `Caddy`.
- Его конфиг лежит в `packages/frontend/Caddyfile`.
- Этот внутренний `Caddy`:
  - раздает `/srv`
  - проксирует `/api/*` в `backend:3000`
  - работает как SPA host через `try_files {path} /index.html`

## Production окружение

- Основной compose: `environments/prod/docker-compose.yml`
- Скрипты:
  - `environments/prod/start.sh`
  - `environments/prod/deploy.sh`
  - `environments/prod/migrate.sh`
  - `environments/prod/stop.sh`
  - `environments/prod/clean.sh`

### Сервисы в prod compose

- `postgres`
- `migrator`
- `backend`
- `frontend`
- внешний `caddy`

### Как устроен production трафик

- Снаружи открыт только внешний `caddy`.
- Он слушает:
  - `80`
  - `443`
- Внешний `caddy` терминирует HTTPS.
- Дальше внутри docker-сети:
  - `/api/*` идет в `backend:3000`
  - остальное идет в `frontend:80`

### Что значит “терминирует HTTPS”

- Браузер пользователя подключается к `Caddy` по `https://...`
- `Caddy` принимает TLS-сертификат и расшифровывает трафик
- дальше запросы уходят внутрь docker-сети уже по обычному HTTP

## Prod env-файлы

Реальные значения не коммитятся. На сервере должны существовать:

- `environments/prod/.env.backend`
- `environments/prod/.env.frontend`
- `environments/prod/.env.caddy`

Шаблоны:

- `environments/prod/.env.backend.example`
- `environments/prod/.env.frontend.example`
- `environments/prod/.env.caddy.example`

### Что лежит в env-файлах

- `.env.backend`
  - database credentials
  - JWT secrets
  - backend runtime env
  - `CORS_ORIGIN`
- `.env.frontend`
  - `VITE_API_BASE_URL=/api`
- `.env.caddy`
  - `SITE_ADDRESS`
  - `ACME_EMAIL`

### Как env загружаются

Скрипты `start.sh`, `deploy.sh`, `migrate.sh` автоматически делают:

- `. ./.env.backend`
- `. ./.env.frontend`
- `. ./.env.caddy`

## CI/CD

### CI

Файл: `.github/workflows/ci.yml`

Запускается:

- на `pull_request`
- на `push` в `main`

Проверяет:

- backend:
  - `npm ci`
  - `npm run type-check`
  - `npm run build`
  - `npm test -- --runInBand`
- frontend:
  - `npm ci`
  - `npm run type-check`
  - `npm run build`

### Deploy

Файл: `.github/workflows/deploy.yml`

Запускается:

- вручную через `workflow_dispatch`
- на `push` в `main`

Что делает:

1. Собирает backend image
2. Собирает frontend image
3. Пушит их в `GHCR`
4. Заходит на сервер по SSH
5. Обновляет код репозитория на сервере
6. Логинится в `ghcr.io`
7. Запускает `environments/prod/deploy.sh`

### Как обновляется код на сервере

Сейчас сервер не использует `git@github.com:...` через свой SSH-ключ.

Вместо этого workflow делает:

- `git fetch https://x-access-token:...@github.com/...`
- `git checkout main`
- `git merge --ff-only FETCH_HEAD`

Это было сделано потому, что раньше падало с ошибкой:

- `git@github.com: Permission denied (publickey)`

### GHCR

Deploy пушит образы:

- `ghcr.io/<owner>/<repo>/backend:<sha>`
- `ghcr.io/<owner>/<repo>/backend:latest`
- `ghcr.io/<owner>/<repo>/frontend:<sha>`
- `ghcr.io/<owner>/<repo>/frontend:latest`

## GitHub Secrets

Для deploy workflow нужны:

- `SSH_HOST`
- `SSH_PORT`
- `SSH_USER`
- `SSH_PRIVATE_KEY`
- `GHCR_READ_TOKEN`

### Что такое `GHCR_READ_TOKEN`

- Это GitHub Personal Access Token.
- Обычно удобнее использовать `PAT classic`.
- Нужные права:
  - `read:packages`
  - `repo`, если репозиторий приватный

Этот токен используется для:

- `git fetch` репозитория на сервере по HTTPS
- `docker login ghcr.io` на сервере
- `docker compose pull` production images

## Сервер

### Текущий путь, который использует deploy workflow

- `/home/monipchenko/project-crm`

### Важно

- Этот путь должен реально существовать на сервере.
- Если bootstrap/README где-то говорит про другой путь, нужно синхронизировать его с workflow.
- Если deploy внезапно падает на `cd ...`, первое что проверять: совпадает ли путь на сервере и путь в `.github/workflows/deploy.yml`.

## Prod scripts

### `environments/prod/start.sh`

Используется для первого ручного запуска или локального production-like старта:

1. `docker compose up -d --build postgres`
2. `docker compose run --rm migrator`
3. `docker compose up -d --build --no-deps backend`
4. `docker compose up -d frontend caddy`

### `environments/prod/deploy.sh`

Используется в CI/CD:

1. `docker compose pull backend frontend`
2. `docker compose up -d postgres`
3. `docker compose run --rm migrator`
4. `docker compose up -d --no-deps backend`
5. `docker compose up -d frontend caddy`

## Makefile

### Local

- `make up`
- `make down`
- `make clean`
- `make restart`
- `make reset`
- `make logs`
- `make ps`
- `make backend-shell`
- `make frontend-shell`
- `make db-shell`
- `make migrate`

### Prod

- `make prod-up`
- `make prod-down`
- `make prod-clean`
- `make prod-restart`
- `make prod-logs`
- `make prod-ps`
- `make prod-migrate`

## Что уже считается важным знанием по проекту

- Local и prod Dockerfile разделены, не смешивать их обратно.
- Для production используется внешний `Caddy`.
- `init` как отдельный SQL-файл больше не должен возвращаться.
- Миграции должны оставаться единственным источником правды по схеме базы.
- Если CI/CD ломается на серверном `git fetch`, сначала смотреть:
  - валиден ли `GHCR_READ_TOKEN`
  - есть ли у токена `repo`
  - совпадает ли путь репозитория на сервере с путем в workflow

## Что полезно проверить при проблемах

### Если не стартует local backend

Проверить:

- bind mounts в `environments/local/docker-compose.yml`
- существует ли `/app/package.json` внутри контейнера
- не сломаны ли `../../packages/backend` и `../../packages/frontend`

### Если не стартует migrator

Проверить:

- что все миграции лежат в `db/migrations`
- что первая миграция создает таблицу `migrations`
- что нигде не осталось ожидания отдельного `/app/init.sql`

### Если не проходит production deploy

Проверить:

- GitHub secrets
- наличие `.env.backend`, `.env.frontend`, `.env.caddy` на сервере
- доступность `ghcr.io`
- правильность `SITE_ADDRESS`
- открыт ли `80/443`
- совпадает ли server path с `deploy.yml`
