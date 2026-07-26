-- Creates or updates the final api-auth schema.
--
-- Requirements:
-- - PostgreSQL 18;
-- - an existing database;
-- - a database user allowed to create and alter tables and constraints.
--
-- This script represents the final state of the TypeORM migrations in
-- src/lib/typeorm/migrations. It can be executed again when the tables already
-- exist. It does not insert sample data and does not update TypeORM's migration
-- history table.

BEGIN;

CREATE TABLE IF NOT EXISTS "user" (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS person (
  id SERIAL PRIMARY KEY,
  cpf VARCHAR(20),
  name VARCHAR(255) NOT NULL,
  birth DATE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,
  user_id INTEGER
);

-- Add components that can be absent in databases created by older versions.
ALTER TABLE "user"
ADD COLUMN IF NOT EXISTS id SERIAL;

ALTER TABLE "user"
ADD COLUMN IF NOT EXISTS username VARCHAR(255);

ALTER TABLE "user"
ADD COLUMN IF NOT EXISTS password VARCHAR(255);

ALTER TABLE "user"
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'Aluno';

ALTER TABLE person
ADD COLUMN IF NOT EXISTS id SERIAL;

ALTER TABLE person
ADD COLUMN IF NOT EXISTS cpf VARCHAR(20);

ALTER TABLE person
ADD COLUMN IF NOT EXISTS name VARCHAR(255);

ALTER TABLE person
ADD COLUMN IF NOT EXISTS birth DATE;

ALTER TABLE person
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

ALTER TABLE person
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'Aluno';

ALTER TABLE person
ADD COLUMN IF NOT EXISTS user_id INTEGER;

-- Backfill roles before enforcing the current NOT NULL contract.
UPDATE "user"
SET role = 'Aluno'
WHERE role IS NULL;

UPDATE person
SET role = 'Aluno'
WHERE role IS NULL;

ALTER TABLE "user"
ALTER COLUMN id SET NOT NULL;

ALTER TABLE "user"
ALTER COLUMN username SET NOT NULL;

ALTER TABLE "user"
ALTER COLUMN password SET NOT NULL;

ALTER TABLE "user"
ALTER COLUMN role SET NOT NULL;

ALTER TABLE person
ALTER COLUMN id SET NOT NULL;

ALTER TABLE person
ALTER COLUMN name SET NOT NULL;

ALTER TABLE person
ALTER COLUMN email SET NOT NULL;

ALTER TABLE person
ALTER COLUMN role SET NOT NULL;

ALTER TABLE person
ALTER COLUMN cpf DROP NOT NULL;

ALTER TABLE person
ALTER COLUMN birth DROP NOT NULL;

ALTER TABLE "user"
ALTER COLUMN role DROP DEFAULT;

ALTER TABLE person
ALTER COLUMN role DROP DEFAULT;

-- Ensure primary keys on the id columns.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = '"user"'::regclass
      AND contype = 'p'
      AND conkey = ARRAY[
        (
          SELECT attnum
          FROM pg_attribute
          WHERE attrelid = '"user"'::regclass
            AND attname = 'id'
        )
      ]::SMALLINT[]
  ) THEN
    ALTER TABLE "user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'person'::regclass
      AND contype = 'p'
      AND conkey = ARRAY[
        (
          SELECT attnum
          FROM pg_attribute
          WHERE attrelid = 'person'::regclass
            AND attname = 'id'
        )
      ]::SMALLINT[]
  ) THEN
    ALTER TABLE person
    ADD CONSTRAINT person_pkey PRIMARY KEY (id);
  END IF;
END $$;

-- Ensure username uniqueness regardless of the existing constraint name.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = '"user"'::regclass
      AND contype = 'u'
      AND conkey = ARRAY[
        (
          SELECT attnum
          FROM pg_attribute
          WHERE attrelid = '"user"'::regclass
            AND attname = 'username'
        )
      ]::SMALLINT[]
  ) THEN
    ALTER TABLE "user"
    ADD CONSTRAINT user_username_unique UNIQUE (username);
  END IF;
END $$;

-- Apply the final role rules from AddAdminRole1784851200000.
ALTER TABLE "user"
DROP CONSTRAINT IF EXISTS user_role_check;

ALTER TABLE "user"
ADD CONSTRAINT user_role_check
CHECK (role IN ('Professor', 'Aluno', 'Administrador'));

ALTER TABLE person
DROP CONSTRAINT IF EXISTS person_role_check;

ALTER TABLE person
ADD CONSTRAINT person_role_check
CHECK (role IN ('Professor', 'Aluno', 'Administrador'));

-- The TypeORM migrations do not define user_id as unique. Remove any
-- single-column UNIQUE constraint left by older manual scripts.
DO $$
DECLARE
  existing_constraint RECORD;
BEGIN
  FOR existing_constraint IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'person'::regclass
      AND contype = 'u'
      AND conkey = ARRAY[
        (
          SELECT attnum
          FROM pg_attribute
          WHERE attrelid = 'person'::regclass
            AND attname = 'user_id'
        )
      ]::SMALLINT[]
  LOOP
    EXECUTE format(
      'ALTER TABLE person DROP CONSTRAINT %I',
      existing_constraint.conname
    );
  END LOOP;
END $$;

-- Replace any existing user_id foreign key with the current reference.
DO $$
DECLARE
  existing_constraint RECORD;
BEGIN
  FOR existing_constraint IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'person'::regclass
      AND contype = 'f'
      AND conkey = ARRAY[
        (
          SELECT attnum
          FROM pg_attribute
          WHERE attrelid = 'person'::regclass
            AND attname = 'user_id'
        )
      ]::SMALLINT[]
  LOOP
    EXECUTE format(
      'ALTER TABLE person DROP CONSTRAINT %I',
      existing_constraint.conname
    );
  END LOOP;
END $$;

ALTER TABLE person
ADD CONSTRAINT person_user_id_fk
FOREIGN KEY (user_id) REFERENCES "user"(id);

COMMIT;

-- Verification: both tables and their columns.
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('user', 'person')
ORDER BY table_name, ordinal_position;

-- Verification: primary keys, unique rules, checks and foreign keys.
SELECT
  conname,
  conrelid::regclass AS table_name,
  pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid IN ('"user"'::regclass, 'person'::regclass)
  AND contype IN ('p', 'u', 'f', 'c')
ORDER BY conrelid::regclass::text, conname;
