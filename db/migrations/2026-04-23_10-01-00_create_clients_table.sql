-- Migration: 2026-04-23_10-01-00_create_clients_table.sql
-- Description: Create clients table

-- migrate:up

BEGIN;

CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone_number VARCHAR(20),
  company VARCHAR(255),
  status VARCHAR(32) NOT NULL DEFAULT 'individual' CHECK (status IN ('individual', 'legal_entity')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP DEFAULT NULL
);

CREATE INDEX idx_clients_email ON clients(email);

COMMIT;

-- migrate:down

BEGIN;

DROP TABLE IF EXISTS clients;

COMMIT;
