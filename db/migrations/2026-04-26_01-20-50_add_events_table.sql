-- Migration: 2026-04-26_01-20-50_add_events_table.sql
-- Description: Add events table

-- migrate:up

begin;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'event_type'
      AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.event_type AS ENUM (
      'note',
      'task',
      'reminder',
      'client_created',
      'order_created',
      'order_updated',
      'order_complete',
      'order_reopened',
      'paid',
      'spent'
    );
  END IF;
END
$$;

ALTER TYPE public.event_type ADD VALUE IF NOT EXISTS 'note';
ALTER TYPE public.event_type ADD VALUE IF NOT EXISTS 'task';
ALTER TYPE public.event_type ADD VALUE IF NOT EXISTS 'reminder';
ALTER TYPE public.event_type ADD VALUE IF NOT EXISTS 'client_created';
ALTER TYPE public.event_type ADD VALUE IF NOT EXISTS 'order_created';
ALTER TYPE public.event_type ADD VALUE IF NOT EXISTS 'order_updated';
ALTER TYPE public.event_type ADD VALUE IF NOT EXISTS 'order_complete';
ALTER TYPE public.event_type ADD VALUE IF NOT EXISTS 'order_reopened';
ALTER TYPE public.event_type ADD VALUE IF NOT EXISTS 'paid';
ALTER TYPE public.event_type ADD VALUE IF NOT EXISTS 'spent';

create table if not exists
  "public"."events" (
    "id" serial not null,
    "original_id" integer null,
    "user_id" UUID not null,
    "client_id" UUID not null,
    "type" public.event_type not null,
    "comment" varchar(255) null,
    "payload" JSONB not null default '{}'::jsonb,
    "created_at" timestamp not null default NOW(),
    "updated_at" TIMESTAMP not null default NOW(),
    "deleted_at" TIMESTAMP null,
    constraint "events_pkey" primary key ("id")
  );

commit;

-- migrate:down

begin;

drop table if exists "public"."events";
drop type if exists public.event_type;

commit;
