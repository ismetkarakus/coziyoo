#!/usr/bin/env bash

set -euo pipefail

SERVER_PID=""
FRONTEND_PID=""
ADMIN_PID=""

cleanup() {
  if [[ -n "${SERVER_PID}" ]]; then
    kill "${SERVER_PID}" >/dev/null 2>&1 || true
  fi
  if [[ -n "${FRONTEND_PID}" ]]; then
    kill "${FRONTEND_PID}" >/dev/null 2>&1 || true
  fi
  if [[ -n "${ADMIN_PID}" ]]; then
    kill "${ADMIN_PID}" >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT INT TERM

echo "[dev:all] Starting backend server..."
npm run server &
SERVER_PID=$!

echo "[dev:all] Starting Expo frontend..."
npm run start -- "$@" &
FRONTEND_PID=$!

if [[ -d "admin-panel" ]]; then
  echo "[dev:all] Starting admin panel..."
  (
    cd admin-panel
    npm run dev
  ) &
  ADMIN_PID=$!
else
  echo "[dev:all] admin-panel directory not found, skipping."
fi

while true; do
  if ! kill -0 "${SERVER_PID}" >/dev/null 2>&1; then
    wait "${SERVER_PID}" || true
    exit 1
  fi

  if ! kill -0 "${FRONTEND_PID}" >/dev/null 2>&1; then
    wait "${FRONTEND_PID}" || true
    exit 1
  fi

  if [[ -n "${ADMIN_PID}" ]] && ! kill -0 "${ADMIN_PID}" >/dev/null 2>&1; then
    wait "${ADMIN_PID}" || true
    exit 1
  fi

  sleep 1
done
