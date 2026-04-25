# Database Migrations

Папка для хранения SQL миграций базы данных.

## Структура файлов миграций

Используется формат: `YYYY-MM-DD_HH-MM-SS_description.sql`

Пример:
- `2026-04-23_10-30-00_create_users_table.sql`
- `2026-04-23_10-31-00_create_clients_table.sql`

## Применение миграций

Миграции применяются вручную или через скрипт при инициализации БД.

```bash
# Применить миграцию через psql
psql -U crm_user -d crm_db -f migration_file.sql
```

## Откат

Каждая миграция должна содержать инструкции для отката (DROP TABLE, etc.)

## Dev dataset

В `dev`-окружении после применения миграций автоматически запускается сид:
[dev-seed.sql](/Users/monipchenko/work/project-crm/db/dev-seed.sql)

Dev credentials для входа во frontend:

- `email`: `dev@example.com`
- `password`: `dev-password-123`

Сид также создаёт несколько клиентов для этого пользователя.
