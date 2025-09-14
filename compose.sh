#!/bin/bash

if [ "$1" = "up" ]; then
  docker compose -f compose.prod.yaml --env-file .env.prod up -d --build
elif [ "$1" = "down" ]; then
  docker compose -f compose.prod.yaml --env-file .env.prod down -v
elif [ -z $1 ]; then
  echo "Please provide a valid argument [up, down]"
else
  echo "Invalid command '$1', must be in [up, down]"
fi

