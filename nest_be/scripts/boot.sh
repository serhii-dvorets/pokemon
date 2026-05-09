#!/bin/bash

if [ ! -f ./.env ]; then
    echo "Operation failed. Check the existance of .env file in the root of the project"
    exit 1
fi

PATH_TO_COMPOSE="./docker/docker-compose.yml"

set -a; source .env; set +a;

export PATH_TO_COMPOSE