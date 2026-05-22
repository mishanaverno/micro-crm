# CRM Environments

## Быстрый старт

### Запуск сервисов
```bash
cd environments
chmod +x start.sh
./start.sh
```

### Остановка сервисов
```bash
./stop.sh
```

### Удаление сервисов и данных
```bash
./clean.sh
```

## Доступ к сервисам

### PostgreSQL
- **Host**: localhost
- **Port**: 5432
- **User**: crm_user
- **Password**: crm_password
- **Database**: crm_db

### Backend API
- **URL**: http://localhost:3000
- **API**: http://localhost:3000/api

### Frontend SPA
- **URL**: http://localhost:5173
- **API Base URL**: http://localhost:3000/api

### Auth
- **Login**: `POST http://localhost:3000/api/auth/login`
- **Refresh**: `POST http://localhost:3000/api/auth/refresh`
- **Me**: `GET http://localhost:3000/api/auth/me`

## Команды Docker

### Просмотр логов
```bash
docker-compose logs -f
```

### Просмотр логов конкретного сервиса
```bash
docker-compose logs -f postgres
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f migrator
```

### Запуск команды в контейнере backend
```bash
docker-compose exec backend npm run lint
docker-compose exec backend npm run type-check
docker-compose exec frontend npm run type-check
```

### Подключение к PostgreSQL из контейнера
```bash
docker-compose exec postgres psql -U crm_user -d crm_db
```

## Структура

- `docker-compose.yml` - Конфигурация контейнеров
- `.env.backend` - Переменные окружения backend для локального docker-запуска
- `.env.frontend` - Переменные окружения frontend для локального docker-запуска
- `start.sh` - Скрипт для запуска сервисов
- `stop.sh` - Скрипт для остановки сервисов
- `clean.sh` - Скрипт для удаления сервисов и данных
- `../packages/backend/Dockerfile` - Dockerfile для backend
- `../packages/frontend/Dockerfile` - Dockerfile для frontend

## Примечания

- Backend ждёт успешного завершения миграций перед стартом
- Backend и frontend имеют healthcheck, поэтому зависимости стартуют надёжнее
- Backend и frontend монтируются целиком как пакеты, а `node_modules` остаются внутри контейнеров
- Frontend доступен через Vite dev server на `5173`
- PostgreSQL данные сохраняются в Docker volume `postgres_data`
- Все сервисы находятся в одной сети `crm-network` для взаимодействия
