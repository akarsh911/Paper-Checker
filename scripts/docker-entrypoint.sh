#!/bin/sh
set -eu

DB_FILE_PATH="${DATABASE_URL#file:}"

mkdir -p /app/data /app/uploads

if [ ! -f "$DB_FILE_PATH" ]; then
  echo "Initializing SQLite database at $DB_FILE_PATH"
  sqlite3 "$DB_FILE_PATH" < /app/scripts/init-db.sql
fi

if [ "${SEED_DEMO_DATA:-false}" = "true" ]; then
  echo "Seeding demo data"
  node /app/scripts/seed-demo.js
fi

exec "$@"
