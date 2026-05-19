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
      'note_created',
      'note_updated',
      'note_deleted',
      'task_created',
      'task_updated',
      'task_deleted',
      'reminder_created',
      'reminder_updated',
      'reminder_deleted',
      'client_created',
      'client_updated',
      'client_deleted',
      'order_created',
      'order_updated',
      'order_deleted',
      'order_complete',
      'order_reopened',
      'paid_created',
      'paid_updated',
      'paid_deleted',
      'spent_created',
      'spent_updated',
      'spent_deleted'
    );
  END IF;
END
$$;

ALTER TYPE public.event_type ADD VALUE IF NOT EXISTS 'note_created';
ALTER TYPE public.event_type ADD VALUE IF NOT EXISTS 'note_updated';
ALTER TYPE public.event_type ADD VALUE IF NOT EXISTS 'note_deleted';
ALTER TYPE public.event_type ADD VALUE IF NOT EXISTS 'task_created';
ALTER TYPE public.event_type ADD VALUE IF NOT EXISTS 'task_updated';
ALTER TYPE public.event_type ADD VALUE IF NOT EXISTS 'task_deleted';
ALTER TYPE public.event_type ADD VALUE IF NOT EXISTS 'reminder_created';
ALTER TYPE public.event_type ADD VALUE IF NOT EXISTS 'reminder_updated';
ALTER TYPE public.event_type ADD VALUE IF NOT EXISTS 'reminder_deleted';
ALTER TYPE public.event_type ADD VALUE IF NOT EXISTS 'client_created';
ALTER TYPE public.event_type ADD VALUE IF NOT EXISTS 'client_updated';
ALTER TYPE public.event_type ADD VALUE IF NOT EXISTS 'client_deleted';
ALTER TYPE public.event_type ADD VALUE IF NOT EXISTS 'order_created';
ALTER TYPE public.event_type ADD VALUE IF NOT EXISTS 'order_updated';
ALTER TYPE public.event_type ADD VALUE IF NOT EXISTS 'order_deleted';
ALTER TYPE public.event_type ADD VALUE IF NOT EXISTS 'order_complete';
ALTER TYPE public.event_type ADD VALUE IF NOT EXISTS 'order_reopened';
ALTER TYPE public.event_type ADD VALUE IF NOT EXISTS 'paid_created';
ALTER TYPE public.event_type ADD VALUE IF NOT EXISTS 'paid_updated';
ALTER TYPE public.event_type ADD VALUE IF NOT EXISTS 'paid_deleted';
ALTER TYPE public.event_type ADD VALUE IF NOT EXISTS 'spent_created';
ALTER TYPE public.event_type ADD VALUE IF NOT EXISTS 'spent_updated';
ALTER TYPE public.event_type ADD VALUE IF NOT EXISTS 'spent_deleted';

create table if not exists
  "public"."events" (
    "id" serial not null,
    "original_id" integer null,
    "user_id" UUID not null,
    "client_id" UUID not null,
    "order_id" integer null,
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
