#!/bin/sh
set -e

echo "Installing dependencies..."

if [ ! -d "node_modules" ] || [ -z "$(ls -A node_modules)" ]; then
  yarn install
fi

exec "$@"
