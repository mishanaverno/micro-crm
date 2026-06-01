-- Migration: 2026-04-23_10-00-00_create_users_table.sql
-- Description: Create users table

-- migrate:up
BEGIN;

CREATE TABLE IF NOT EXISTS
 "migrations" (
    "id" serial NOT NULL,
    "file" varchar(255) NOT NULL UNIQUE,
    "created_at" timestamp NOT NULL DEFAULT NOW(),
    constraint "migrations_pkey" PRIMARY KEY ("id")
  );

CREATE UNIQUE INDEX IF NOT EXISTS "miggrations_index" on "migrations" ("file" ASC);

COMMIT;

-- migrate:down
