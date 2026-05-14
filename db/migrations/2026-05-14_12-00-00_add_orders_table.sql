-- Migration: 2026-05-14_12-00-00_add_orders_table.sql
-- Description: Add orders table

-- migrate:up

begin;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'order_status'
      AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.order_status AS ENUM ('created', 'inprogress', 'done');
  END IF;
END
$$;

create table if not exists
  "public"."orders" (
    "id" serial not null,
    "user_id" UUID not null,
    "client_id" UUID not null,
    "title" varchar(255) null default 'order',
    "price" numeric(12, 2) not null default 0,
    "content" varchar(255) not null default '',
    "status" public.order_status not null default 'created',
    "created_at" timestamp not null default NOW(),
    "updated_at" TIMESTAMP not null default NOW(),
    "deleted_at" TIMESTAMP null,
    constraint "orders_pkey" primary key ("id")
  );

commit;

-- migrate:down

begin;

drop table if exists "public"."orders";
drop type if exists public.order_status;

commit;
