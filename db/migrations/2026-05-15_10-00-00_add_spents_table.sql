-- Migration: 2026-05-15_10-00-00_add_spents_table.sql
-- Description: Add spents table

-- migrate:up

begin;

create table if not exists
  "public"."spents" (
    "id" serial not null,
    "user_id" uuid not null,
    "client_id" uuid not null,
    "order_id" integer not null,
    "value" numeric(12, 2) not null,
    "created_at" timestamp not null default NOW(),
    "updated_at" timestamp not null default NOW(),
    "deleted_at" timestamp null,
    constraint "spents_pkey" primary key ("id"),
    constraint "spents_value_positive_check" check ("value" > 0)
  );

commit;

-- migrate:down

begin;

drop table if exists "public"."spents";

commit;
