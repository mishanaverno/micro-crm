-- Migration: 2026-05-14_15-00-00_add_paids_table.sql
-- Description: Add paids table

-- migrate:up

begin;

create table if not exists
  "public"."paids" (
    "id" serial not null,
    "user_id" uuid not null,
    "client_id" uuid not null,
    "order_id" integer not null,
    "value" numeric(12, 2) not null default 0,
    "created_at" timestamp not null default NOW(),
    "updated_at" timestamp not null default NOW(),
    "deleted_at" timestamp null,
    constraint "paids_pkey" primary key ("id")
  );

commit;

-- migrate:down

begin;

drop table if exists "public"."paids";

commit;
