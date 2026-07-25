-- Manual migrations for api-auth.
-- Execute this file in PostgreSQL using the same database configured in .env.
--
-- Final schema represented by the TypeORM migrations in
-- src/lib/typeorm/migrations:
--   "user" 1 ---- 0..N person
--
-- Notes:
-- - "user".username is unique and used for sign-in.
-- - "user".password stores a bcrypt hash.
-- - person.user_id is optional and is not unique in the TypeORM migrations.
-- - role accepts only 'Professor', 'Aluno' or 'Administrador'.

BEGIN;

CREATE TABLE IF NOT EXISTS "user" (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL
    CHECK (role IN ('Professor', 'Aluno', 'Administrador'))
);

CREATE TABLE IF NOT EXISTS person (
  id SERIAL PRIMARY KEY,
  cpf VARCHAR(20),
  name VARCHAR(255) NOT NULL,
  birth DATE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL
    CHECK (role IN ('Professor', 'Aluno', 'Administrador')),
  user_id INTEGER REFERENCES "user"(id)
);

-- Compatibility with databases created from older migrations.
ALTER TABLE "user"
ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'Aluno';

ALTER TABLE person
ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'Aluno';

ALTER TABLE person
ADD COLUMN IF NOT EXISTS user_id INTEGER;

-- This constraint existed in an older version of this manual script, but it
-- is not present in the TypeORM migrations.
DO $$
DECLARE
  unique_constraint RECORD;
BEGIN
  FOR unique_constraint IN
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
      unique_constraint.conname
    );
  END LOOP;
END $$;

ALTER TABLE person
ALTER COLUMN cpf DROP NOT NULL;

ALTER TABLE person
ALTER COLUMN birth DROP NOT NULL;

-- Remove defaults after backfilling older rows.
ALTER TABLE "user"
ALTER COLUMN role DROP DEFAULT;

ALTER TABLE person
ALTER COLUMN role DROP DEFAULT;

-- Ensure the username rule from the initial migration also exists when this
-- script is executed against an older database.
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

-- Final state of AddAdminRole1784851200000.
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

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'person'::regclass
      AND confrelid = '"user"'::regclass
      AND contype = 'f'
      AND conkey = ARRAY[
        (
          SELECT attnum
          FROM pg_attribute
          WHERE attrelid = 'person'::regclass
            AND attname = 'user_id'
        )
      ]::SMALLINT[]
  ) THEN
    ALTER TABLE person
    ADD CONSTRAINT person_user_id_fk
    FOREIGN KEY (user_id) REFERENCES "user"(id);
  END IF;
END $$;

COMMIT;

-- Verification queries.
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('user', 'person')
ORDER BY table_name;

SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('user', 'person')
ORDER BY table_name, ordinal_position;

SELECT conname, conrelid::regclass AS table_name, pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid IN ('"user"'::regclass, 'person'::regclass)
  AND contype IN ('p', 'u', 'f', 'c')
ORDER BY conrelid::regclass::text, conname;

SELECT
  u.id AS user_id,
  u.username,
  u.role AS user_role,
  p.id AS person_id,
  p.name AS person_name,
  p.role AS person_role
FROM "user" u
LEFT JOIN person p ON p.user_id = u.id
ORDER BY u.id;
