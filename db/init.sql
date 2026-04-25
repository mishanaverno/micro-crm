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
