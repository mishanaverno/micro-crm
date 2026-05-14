-- Migration: 2026-04-26_01-21-02_add_notes_table.sql
-- Description: Add notes table

-- migrate:up

begin;

create table if not exists
    "public"."notes" (
    "id" serial not null,
    "user_id" UUID not null,
    "client_id" UUID not null,
    "order_id" integer null,
    "content" varchar(255) not null DEFAULT '',
    "created_at" timestamp not null default NOW(),
    "updated_at" TIMESTAMP not null default NOW(),
    "deleted_at" TIMESTAMP null,
    constraint "notes_pkey" primary key ("id")
  );
commit;

-- migrate:down

begin;

drop table if exists "public"."notes";

commit;
