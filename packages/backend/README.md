# CRM Backend API

NestJS Backend для CRM системы с поддержкой PostgreSQL, TypeORM и Swagger документацией.

## 🚀 Быстрый старт

### Предварительные требования

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker (для локальной разработки с БД)

### Установка зависимостей

```bash
npm install
# или для frozen lock file
npm run init
```

### Запуск в режиме разработки

```bash
npm run dev
```

Приложение будет доступно на `http://localhost:3000`

### Запуск в production

```bash
npm run build
npm start
```

## 📚 Документация API

### Swagger UI

После запуска приложения откройте:
**http://localhost:3000/api/docs**

Здесь вы найдёте полную документацию всех endpoints с примерами запросов и ответов.

### API Endpoints

#### Users (`/api/users`)
- `POST /api/users` — создать нового пользователя
- `GET /api/users` — получить список всех пользователей
- `GET /api/users/:id` — получить пользователя по ID
- `PATCH /api/users/:id` — обновить данные пользователя
- `DELETE /api/users/:id` — удалить пользователя

#### Clients (`/api/clients`)
- `POST /api/clients` — создать нового клиента
- `GET /api/clients` — получить список всех клиентов
- `GET /api/clients/:id` — получить клиента по ID
- `PATCH /api/clients/:id` — обновить данные клиента
- `DELETE /api/clients/:id` — удалить клиента

## 🗄️ База данных

### Подключение

Конфигурация БД находится в `src/config/typeorm.config.ts`

#### Переменные окружения

Создайте файл `.env` в корне backend папки:

```env
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=crm_user
DATABASE_PASSWORD=crm_password
DATABASE_NAME=crm_db

# Environment
NODE_ENV=development
PORT=3000
```

### Миграции БД

Миграции находятся в папке `db-migrations/migrations/`

#### Выполнение миграций (из контейнера)

```bash
docker-compose exec backend bash db-migrations/run-migrations.sh
```

## 🐳 Docker

### Запуск с Docker Compose

В папке `test-environment/`:

```bash
./start.sh      # Запустить контейнеры
./stop.sh       # Остановить контейнеры
./clean.sh      # Удалить контейнеры и данные
```

### Просмотр логов

```bash
docker-compose logs -f backend        # Логи backend
docker-compose logs -f postgres       # Логи БД
docker-compose logs -f                # Все логи
```

### Подключение к PostgreSQL в контейнере

```bash
docker-compose exec postgres psql -U crm_user -d crm_db
```

## 📋 Структура проекта

```
src/
├── main.ts                 # Entry point
├── app.module.ts           # Root модуль
├── config/
│   └── typeorm.config.ts   # TypeORM конфигурация
├── users/
│   ├── dto/
│   │   ├── create-user.dto.ts
│   │   └── update-user.dto.ts
│   ├── entities/
│   │   └── user.entity.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
├── clients/
│   ├── dto/
│   │   ├── create-client.dto.ts
│   │   └── update-client.dto.ts
│   ├── entities/
│   │   └── client.entity.ts
│   ├── clients.controller.ts
│   ├── clients.service.ts
│   └── clients.module.ts
└── common/                 # Общие утилиты и интерфейсы

db-migrations/
├── migrations/             # SQL файлы миграций
└── run-migrations.sh       # Скрипт для выполнения миграций
```

## 🛠️ Доступные команды

```bash
# Development
npm run dev              # Запуск с watch mode

# Building
npm run build            # Компиляция TypeScript
npm run build:prod       # Production сборка

# Running
npm start               # Запуск скомпилированного приложения

# Code quality
npm run lint            # Запуск ESLint
npm run type-check      # Проверка TypeScript типов

# Testing
npm run test            # Запуск тестов
npm run test:watch      # Тесты с watch mode
npm run test:cov        # Тесты с покрытием

# Installation
npm run install         # Установка зависимостей (frozen lock file)
```

## 📦 Основные зависимости

- **@nestjs/common** — core NestJS функциональность
- **@nestjs/core** — NestJS ядро
- **@nestjs/typeorm** — интеграция TypeORM с NestJS
- **@nestjs/swagger** — документация API через Swagger
- **typeorm** — ORM для работы с БД
- **pg** — драйвер PostgreSQL
- **class-validator** — валидация данных
- **class-transformer** — трансформация данных
- **rxjs** — реактивное программирование

## 🔍 Примеры запросов

### Создать пользователя

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Получить всех пользователей

```bash
curl http://localhost:3000/api/users
```

### Получить пользователя по ID

```bash
curl http://localhost:3000/api/users/{id}
```

### Обновить пользователя

```bash
curl -X PATCH http://localhost:3000/api/users/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Jane"
  }'
```

### Удалить пользователя

```bash
curl -X DELETE http://localhost:3000/api/users/{id}
```

## 🐛 Отладка

### Включение логирования БД

Установите `NODE_ENV=development` для вывода всех SQL запросов в консоль.

### Проверка ошибок TypeScript

```bash
npm run type-check
```

### Проверка кода с ESLint

```bash
npm run lint
```

## 📝 Валидация данных

Проект использует `class-validator` для валидации входящих данных.

Все DTO классы содержат декораторы валидации:
- `@IsString()` — должно быть строка
- `@IsEmail()` — должно быть email
- `@IsNotEmpty()` — обязательное поле
- `@MinLength(n)` — минимальная длина
- `@IsOptional()` — опциональное поле

Примеры находятся в:
- `src/users/dto/create-user.dto.ts`
- `src/clients/dto/create-client.dto.ts`

## 🔐 Важные замечания

- Пароли пользователей хранятся без шифрования (для разработки). Для production нужно добавить хеширование (bcrypt, argon2)
- На данный момент нет аутентификации. Для production нужно добавить JWT или сессии
- Нет ограничения на количество запросов (rate limiting)
- Нет CORS конфигурации (может быть необходимо для frontend)

## 📖 Полезные ссылки

- [NestJS документация](https://docs.nestjs.com/)
- [TypeORM документация](https://typeorm.io/)
- [Swagger/OpenAPI](https://swagger.io/)
- [PostgreSQL документация](https://www.postgresql.org/docs/)
- [Class Validator](https://github.com/typestack/class-validator)
- [Docker документация](https://docs.docker.com/)

## 🤝 Разработка

### Добавление нового модуля

```bash
nest generate module features/new-feature
nest generate controller features/new-feature
nest generate service features/new-feature
```

### Создание нового сервиса

```bash
nest generate service my-service
```

## 📞 Поддержка

Для вопросов и проблем смотрите:
1. Документацию NestJS: https://docs.nestjs.com/
2. Swagger документацию API: http://localhost:3000/api/docs
3. Логи контейнера: `docker-compose logs backend`

---

**Версия:** 1.0.0  
**Последнее обновление:** апреля 2026
