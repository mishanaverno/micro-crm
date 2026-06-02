#!/bin/sh

set -e

. ./load-env.sh

IMAGE_TAG_VALUE=${IMAGE_TAG:-latest}
BACKEND_IMAGE_TAG_VALUE=${BACKEND_IMAGE_TAG:-$IMAGE_TAG_VALUE}
FRONTEND_IMAGE_TAG_VALUE=${FRONTEND_IMAGE_TAG:-$IMAGE_TAG_VALUE}
LANDING_IMAGE_TAG_VALUE=${LANDING_IMAGE_TAG:-$IMAGE_TAG_VALUE}

export BACKEND_IMAGE_TAG=$BACKEND_IMAGE_TAG_VALUE
export FRONTEND_IMAGE_TAG=$FRONTEND_IMAGE_TAG_VALUE
export LANDING_IMAGE_TAG=$LANDING_IMAGE_TAG_VALUE

echo "Pulling images:"
echo "  backend: ${BACKEND_IMAGE_TAG_VALUE}"
echo "  frontend: ${FRONTEND_IMAGE_TAG_VALUE}"
echo "  landing: ${LANDING_IMAGE_TAG_VALUE}"
docker compose pull backend frontend landing

echo "Starting database"
docker compose up -d postgres

echo "Running migrations"
docker compose run --rm migrator

echo "Starting application"
docker compose up -d --no-deps backend
docker compose up -d frontend landing caddy
