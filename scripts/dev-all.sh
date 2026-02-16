#!/usr/bin/env bash

set -euo pipefail

SERVER_PID=""
FRONTEND_PID=""

cleanup() {
  if [[ -n "${SERVER_PID}" ]]; then
    kill "${SERVER_PID}" >/dev/null 2>&1 || true
  fi
  if [[ -n "${FRONTEND_PID}" ]]; then
    kill "${FRONTEND_PID}" >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT INT TERM

echo "[dev:all] Starting backend server..."
npm run server &
SERVER_PID=$!

echo "[dev:all] Starting Expo frontend..."
npm run start -- "$@" &
FRONTEND_PID=$!

while true; do
  if ! kill -0 "${SERVER_PID}" >/dev/null 2>&1; then
    wait "${SERVER_PID}" || true
    exit 1
  fi

  if ! kill -0 "${FRONTEND_PID}" >/dev/null 2>&1; then
    wait "${FRONTEND_PID}" || true
    exit 1
  fi

  sleep 1
done
