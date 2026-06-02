#!/bin/sh

set -e

set -a
. ./.env.backend
. ./.env.frontend
. ./.env.caddy
set +a

docker compose run --rm migrator
