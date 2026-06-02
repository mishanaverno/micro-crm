#!/bin/sh

set -e

. ./load-env.sh

docker compose up -d --build postgres
docker compose run --rm migrator
docker compose up -d --build --no-deps backend
docker compose up -d frontend caddy
