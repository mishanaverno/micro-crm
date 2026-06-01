#!/bin/sh

set -e

set -a
. ./.env.backend
. ./.env.frontend
. ./.env.caddy
set +a

docker compose up -d --build postgres
docker compose run --rm migrator
docker compose up -d --build --no-deps backend
docker compose up -d frontend caddy
