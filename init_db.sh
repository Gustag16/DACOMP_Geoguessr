#!/bin/bash
set -e
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    \copy "Guessing_Game_location" FROM '/docker-entrypoint-initdb.d/Location_satellite.csv' DELIMITER ',' CSV HEADER;
EOSQL
