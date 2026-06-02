#!/bin/sh

set -e

created_files=""

ensure_env_file() {
  target_file="$1"
  example_file="$2"

  if [ -f "$target_file" ]; then
    return 0
  fi

  if [ ! -f "$example_file" ]; then
    echo "Missing required env file: $target_file" >&2
    echo "Template file not found: $example_file" >&2
    exit 1
  fi

  cp "$example_file" "$target_file"
  created_files="$created_files $target_file"
}

ensure_env_file ./.env.backend ./.env.backend.example
ensure_env_file ./.env.frontend ./.env.frontend.example
ensure_env_file ./.env.caddy ./.env.caddy.example

if [ -n "$created_files" ]; then
  echo "Created missing env files from templates:$created_files" >&2
  echo "Review and replace placeholder values before rerunning deploy." >&2
  exit 1
fi

set -a
. ./.env.backend
. ./.env.frontend
. ./.env.caddy
set +a
