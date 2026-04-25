-- Migration: 2026-04-25_14-00-00_add_hashed_refresh_token_to_users.sql
-- Description: Add hashed refresh token column to users table

-- migrate:up

BEGIN;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS hashed_refresh_token VARCHAR(255);

COMMIT;

-- migrate:down

BEGIN;

ALTER TABLE users
DROP COLUMN IF EXISTS hashed_refresh_token;

COMMIT;
