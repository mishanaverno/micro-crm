-- Migration: 2026-05-15_11-00-00_add_tasks_table.sql
-- Description: Add tasks table

-- migrate:up

begin;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'task_status'
      AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.task_status AS ENUM ('pending', 'complete');
  END IF;
END
$$;

create table if not exists
  "public"."tasks" (
    "id" serial not null,
    "user_id" uuid not null,
    "client_id" uuid not null,
    "order_id" integer null,
    "content" text not null,
    "status" public.task_status not null default 'pending',
    "created_at" timestamp not null default NOW(),
    "updated_at" timestamp not null default NOW(),
    "deleted_at" timestamp null,
    constraint "tasks_pkey" primary key ("id")
  );

commit;

-- migrate:down

begin;

drop table if exists "public"."tasks";
drop type if exists public.task_status;

commit;
