-- Migration: 2026-05-15_12-00-00_add_reminders_table.sql
-- Description: Add reminders table

-- migrate:up

begin;

create table if not exists
  "public"."reminders" (
    "id" serial not null,
    "user_id" uuid not null,
    "client_id" uuid not null,
    "order_id" integer null,
    "content" text not null,
    "timestamp" timestamp not null,
    "created_at" timestamp not null default NOW(),
    "updated_at" timestamp not null default NOW(),
    "deleted_at" timestamp null,
    constraint "reminders_pkey" primary key ("id")
  );

commit;

-- migrate:down

begin;

drop table if exists "public"."reminders";

commit;
