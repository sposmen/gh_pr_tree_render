#!/bin/sh
set -e

# Dependencies and frontend assets are prepared when building the image.
exec "$@"
