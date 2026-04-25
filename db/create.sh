#!/bin/sh
set -e

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
MIGRATIONS_DIR="$SCRIPT_DIR/migrations"

if [ -z "$1" ]; then
  echo "Usage: $0 <migration_description>"
  exit 1
fi

DESCRIPTION="$*"

SAFE_DESCRIPTION=$(echo "$DESCRIPTION" \
  | tr '[:upper:]' '[:lower:]' \
  | sed 's/[^a-z0-9 ]//g' \
  | tr ' ' '_' \
  | tr -s '_')

TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")

FILENAME="${TIMESTAMP}_${SAFE_DESCRIPTION}.sql"
FILEPATH="$MIGRATIONS_DIR/$FILENAME"

mkdir -p "$MIGRATIONS_DIR"

cat <<EOF > "$FILEPATH"
-- Migration: $FILENAME
-- Description: $DESCRIPTION

-- migrate:up


-- migrate:down

EOF

echo "Migration created: $FILEPATH"
