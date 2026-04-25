#!/bin/sh

set -e

DB_HOST=${DATABASE_HOST:-localhost}
DB_PORT=${DATABASE_PORT:-5432}
DB_USER=${DATABASE_USER:-crm_user}
DB_NAME=${DATABASE_NAME:-crm_db}
MIGRATIONS_TABLE="migrations"
MIGRATIONS_DIR="migrations"
INIT_SQL="init.sql"
DEV_SEED_ENABLED=${DEV_SEED_ENABLED:-false}
DEV_SEED_SQL=${DEV_SEED_SQL:-dev-seed.sql}

export PGPASSWORD="$DATABASE_PASSWORD"

psql \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  -f "$INIT_SQL" \
  -q

echo "Running migrations"

# безопасный проход по файлам
find "$MIGRATIONS_DIR" -name "*.sql" | sort | while IFS= read -r migration_file; do
  FILE=$(basename "$migration_file")

  COUNT=$(psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    -t -A \
    -c "SELECT 1 FROM $MIGRATIONS_TABLE WHERE file='${FILE}' LIMIT 1")

  if [ -z "$COUNT" ]; then
    echo "Running migration: ${FILE}"

    # вытаскиваем только migrate:up
    awk '
      /^--[[:space:]]*migrate:up/ { mode="up"; next }
      /^--[[:space:]]*migrate:down/ { mode="down"; next }
      mode=="up" { print }
    ' "$migration_file" | psql \
      -h "$DB_HOST" \
      -p "$DB_PORT" \
      -U "$DB_USER" \
      -d "$DB_NAME"

    psql \
      -h "$DB_HOST" \
      -p "$DB_PORT" \
      -U "$DB_USER" \
      -d "$DB_NAME" \
      -c "INSERT INTO $MIGRATIONS_TABLE (file) VALUES ('$FILE')"

    echo "✓ Migration completed: $FILE"
  else
    echo "$FILE already applied!"
  fi
done

echo "All migrations completed successfully!"

if [ "$DEV_SEED_ENABLED" = "true" ]; then
  if [ -f "$DEV_SEED_SQL" ]; then
    echo "Running dev seed: $DEV_SEED_SQL"
    psql \
      -h "$DB_HOST" \
      -p "$DB_PORT" \
      -U "$DB_USER" \
      -d "$DB_NAME" \
      -f "$DEV_SEED_SQL" \
      -q
    echo "✓ Dev seed completed: $DEV_SEED_SQL"
  else
    echo "Dev seed file not found: $DEV_SEED_SQL"
    exit 1
  fi
fi
