#!/bin/sh

set -e

set -a
. ./.env.backend
. ./.env.frontend
. ./.env.caddy
set +a

IMAGE_TAG_VALUE=${IMAGE_TAG:-latest}

echo "Pulling images for tag: ${IMAGE_TAG_VALUE}"
docker compose pull backend frontend

echo "Starting database"
docker compose up -d postgres

echo "Running migrations"
docker compose run --rm migrator

echo "Starting application"
docker compose up -d --no-deps backend
docker compose up -d frontend caddy
