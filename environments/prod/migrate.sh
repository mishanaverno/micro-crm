#!/bin/sh

set -e

. ./load-env.sh

docker compose run --rm migrator
