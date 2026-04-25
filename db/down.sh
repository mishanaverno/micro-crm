#!/bin/sh
set -e

# Проверка аргумента
if [ "$#" -eq 0 ]; then
  echo "Usage: $0 <migration_file>"
  exit 1
fi

MIGRATION_FILE="$1"

if [ ! -f "$MIGRATION_FILE" ]; then
  echo "File not found: $MIGRATION_FILE" >&2
  exit 1
fi

DB_HOST=${DATABASE_HOST:-localhost}
DB_PORT=${DATABASE_PORT:-5432}
DB_USER=${DATABASE_USER:-crm_user}
DB_NAME=${DATABASE_NAME:-crm_db}
MIGRATIONS_TABLE="migrations"

export PGPASSWORD="$DATABASE_PASSWORD"

FILE=$(basename "$MIGRATION_FILE")

# Экранируем имя файла (на всякий случай)
SAFE_FILE=$(printf "%s" "$FILE" | sed "s/'/''/g")

echo "Rolling back migration: $FILE"

# Проверяем, применялась ли миграция
EXISTS=$(psql \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  -t -A \
  -c "SELECT 1 FROM $MIGRATIONS_TABLE WHERE file='${SAFE_FILE}' LIMIT 1")

if [ -z "$EXISTS" ]; then
  echo "Migration not applied: $FILE"
  exit 1
fi

# Проверяем наличие блока down
HAS_DOWN=$(awk '
  /^--[[:space:]]*migrate:down/ { found=1 }
  END { print found }
' "$MIGRATION_FILE")

if [ "$HAS_DOWN" != "1" ]; then
  echo "No -- migrate:down section found in $MIGRATION_FILE" >&2
  exit 1
fi

echo "Executing down SQL..."

# Выполняем down
awk '
  /^--[[:space:]]*migrate:up/ { mode="up"; next }
  /^--[[:space:]]*migrate:down/ { mode="down"; next }
  mode=="down" { print }
' "$MIGRATION_FILE" | psql \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME"

echo "Removing migration record..."

# Удаляем запись
psql \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  -c "DELETE FROM $MIGRATIONS_TABLE WHERE file='${SAFE_FILE}'"

echo "✓ Migration rolled back: $FILE"