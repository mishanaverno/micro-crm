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
