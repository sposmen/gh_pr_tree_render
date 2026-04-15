#!/bin/sh
set -e

echo "Installing dependencies..."
yarn install --frozen-lockfile

echo "Building assets..."
yarn run build:prod

exec "$@"
