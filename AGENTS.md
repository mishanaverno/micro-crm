# AGENTS

Рабочая памятка по проекту `project-crm`.

## Общее

- Репозиторий: monorepo с `packages/backend`, `packages/frontend`, `db`, `environments`.
- Основной язык общения по проекту: русский.
- Локальная среда живет в `environments/local`.
- Продовая среда живет в `environments/prod`.
- Во frontend для перехода на страницу клиента использовать компонент `packages/frontend/src/components/client-link.tsx`.
- `ClientLink` должен оставаться единым паттерном ссылки на клиента: аватарка + имя + переход в карточку клиента.
- Во frontend для перехода на страницу заказа использовать компонент `packages/frontend/src/components/order-link.tsx`.
- `OrderLink` должен оставаться единым паттерном ссылки на заказ: общий бордер ссылки, бейдж `#id`, справа название/лейбл заказа с `nowrap` и усечением длинного текста, переход в карточку заказа.
- Для disclosure/spoiler UI сначала использовать уже подключенные shadcn/radix-компоненты проекта.
- Если в проекте уже используется подходящий Radix primitive, предпочтительно добавить локальную shadcn-style обертку в `packages/frontend/src/components/ui/*` и реэкспорт в `packages/frontend/src/shared/ui/*`.
- Нативный HTML (`details/summary`) использовать только как fallback, когда подходящего shadcn/radix-компонента в проекте действительно нет и добавление зависимости нецелесообразно.
- Для create/edit форм сущностей во frontend использовать `Sheet` из shadcn (`packages/frontend/src/shared/ui/sheet.tsx`).
- `Dialog` оставлять для confirm/delete и прочих коротких модальных действий, где нужен именно blocking confirm-pattern.
- Для общих страниц со списком сущностей (`clients`, `orders`, `notes`, `tasks`, `reminders`, `finances`) в хедере должны быть только рабочие контролы без декоративного или поясняющего текста.
- На таких list pages обязательно должны быть:
  - пагинация
  - кнопка `Создать`
  - управление колонками
  - управление сортировкой
- `CardDescription` и любой лишний explanatory text в header общих страниц со списками не использовать.
- Для общей обвязки list pages использовать `packages/frontend/src/components/entity-list-card.tsx`, а не собирать заново вручную связку `Card + toolbar + sort + columns`.
- Если странице нужна сортировка, в `EntityListCard` передавать `sortOptions`; при неконтролируемом использовании можно задавать `defaultSort`.
- Для backend-driven list pages предпочтителен контролируемый режим `EntityListCard`: страница хранит `sortBy/sortDirection` в state, передает их в `sort` и синхронизирует через `onSortChange`.

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
  - `VITE_API_BASE_URL=https://api.<domain>/api`
- `.env.caddy`
  - `LANDING_DOMAIN`
  - `APP_DOMAIN`
  - `API_DOMAIN`
  - `ACME_EMAIL`

### Как env загружаются

Скрипты `start.sh`, `deploy.sh`, `migrate.sh` автоматически делают:

- `. ./.env.backend`
- `. ./.env.frontend`
- `. ./.env.caddy`

### Как env попадают на сервер

- В CI/CD production `.env.backend`, `.env.frontend`, `.env.caddy` генерируются workflow `deploy.yml` из GitHub Variables и GitHub Secrets.
- `.example` файлы остаются шаблонами для ручного bootstrap и справки.

## CI/CD

### CI

Файл: `.github/workflows/ci.yml`

Запускается:

- на `pull_request`
- на каждый `push`

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
- при merge `pull_request` в `main`

Что делает:

1. Собирает backend image
2. Собирает frontend image
3. Собирает landing image
4. Пушит их в `GHCR`
5. Заходит на сервер по SSH
6. Обновляет код репозитория на сервере
7. Генерирует `environments/prod/.env.backend`, `.env.frontend`, `.env.caddy` из GitHub Variables и GitHub Secrets
8. Логинится в `ghcr.io`
9. Запускает `environments/prod/deploy.sh`

### Как обновляется код на сервере

Сейчас сервер не использует `git@github.com:...` через свой SSH-ключ.

Вместо этого workflow делает:

- `git fetch https://x-access-token:...@github.com/...`
- `git checkout main`
- `git merge --ff-only FETCH_HEAD`

Это было сделано потому, что раньше падало с ошибкой:

- `git@github.com: Permission denied (publickey)`

### Важный нюанс trigger'ов

- deploy workflow при событии merge PR в `main` выкатывает уже актуальный `main` с сервера, а не head ветки PR
- поэтому deploy привязан именно к завершенному merge, а не к каждому обновлению pull request

### GHCR

Deploy пушит образы:

- `ghcr.io/<owner>/<repo>/backend:<sha>`
- `ghcr.io/<owner>/<repo>/backend:latest`
- `ghcr.io/<owner>/<repo>/frontend:<sha>`
- `ghcr.io/<owner>/<repo>/frontend:latest`
- `ghcr.io/<owner>/<repo>/landing:<sha>`
- `ghcr.io/<owner>/<repo>/landing:latest`

## GitHub Variables

Для deploy workflow нужны:

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

## GitHub Secrets

Для deploy workflow нужны:

- `SSH_HOST`
- `SSH_PORT`
- `SSH_USER`
- `SSH_PRIVATE_KEY`
- `GHCR_READ_TOKEN`
- `PROD_DATABASE_PASSWORD`
- `PROD_JWT_ACCESS_SECRET`
- `PROD_JWT_REFRESH_SECRET`

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
- Для backend общих list endpoints (`clients`, `orders`, `notes`, `tasks`, `reminders`, `finances`) нужно поддерживать user-facing пагинацию и сортировку.
- Для backend list endpoints дефолтная сортировка должна быть по `created_at`.
- У всех backend list endpoints должен быть доступен `sortBy=updated_at` как минимум один из поддерживаемых вариантов сортировки.
- Для detail/dashboard экранов допустимо сохранять режим без пагинации, но общий list endpoint должен уметь принимать `page`, `pageSize`, `sortBy`, `sortDirection`.
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
