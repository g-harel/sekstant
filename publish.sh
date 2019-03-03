#!/bin/bash

# https://cloud.google.com/container-registry/docs/pushing-and-pulling

NAME="gcr.io/sekstant/sekstant"

MAJOR="$1"
MINOR="$2"
PATCH="$3"

if [ -z "$MAJOR" -o -z "$MINOR" -o -z "$PATCH" ]; then
  echo "Usage: publish.sh [MAJOR] [MINOR] [PATCH]"
  exit 1
fi

VERSION="$MAJOR.$MINOR.$PATCH"

docker build -t "$NAME" .
docker tag "$NAME" "$NAME:$VERSION"

docker push "$NAME"
docker push "$NAME:$VERSION"
