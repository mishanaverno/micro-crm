# CRM Test Environment

## Быстрый старт

### Запуск сервисов
```bash
cd test-environment
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

## Команды Docker

### Просмотр логов
```bash
docker-compose logs -f
```

### Просмотр логов конкретного сервиса
```bash
docker-compose logs -f postgres
docker-compose logs -f backend
```

### Запуск команды в контейнере backend
```bash
docker-compose exec backend npm run lint
docker-compose exec backend npm run type-check
```

### Подключение к PostgreSQL из контейнера
```bash
docker-compose exec postgres psql -U crm_user -d crm_db
```

## Структура

- `docker-compose.yml` - Конфигурация контейнеров
- `start.sh` - Скрипт для запуска сервисов
- `stop.sh` - Скрипт для остановки сервисов
- `clean.sh` - Скрипт для удаления сервисов и данных
- `../packages/backend/Dockerfile` - Dockerfile для backend
- `../packages/backend/.env` - Переменные окружения

## Примечания

- Backend будет автоматически пересоздаваться при изменении файлов в `src/`
- PostgreSQL данные сохраняются в Docker volume `postgres_data`
- Оба сервиса находятся в одной сети `crm-network` для взаимодействия
