#!/bin/sh

set -e

require_env_file() {
  target_file="$1"

  if [ ! -f "$target_file" ]; then
    echo "Missing required env file: $target_file" >&2
    exit 1
  fi
}

require_env_file ./.env.backend
require_env_file ./.env.frontend
require_env_file ./.env.caddy

set -a
. ./.env.backend
. ./.env.frontend
. ./.env.caddy
set +a

require_env_var() {
  var_name="$1"
  var_value="$2"

  if [ -z "$var_value" ]; then
    echo "Missing required env var: $var_name" >&2
    exit 1
  fi
}

require_env_var DATABASE_PASSWORD "${DATABASE_PASSWORD:-}"
require_env_var JWT_ACCESS_SECRET "${JWT_ACCESS_SECRET:-}"
require_env_var JWT_REFRESH_SECRET "${JWT_REFRESH_SECRET:-}"
require_env_var LANDING_DOMAIN "${LANDING_DOMAIN:-}"
require_env_var APP_DOMAIN "${APP_DOMAIN:-}"
require_env_var API_DOMAIN "${API_DOMAIN:-}"
require_env_var ACME_EMAIL "${ACME_EMAIL:-}"
