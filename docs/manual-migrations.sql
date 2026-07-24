-- Manual migrations for api-auth.
-- Execute this file in PostgreSQL using the same database configured in .env.
--
-- Current DER:
--   "user" 1 ---- 0..1 person
--
-- Notes:
-- - "user".username is unique and used for sign-in.
-- - "user".password stores a bcrypt hash.
-- - person.user_id is optional, but unique when present.
-- - role accepts only 'Professor', 'Aluno' or 'Administrador'.

BEGIN;

CREATE TABLE IF NOT EXISTS "user" (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
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

-- Compatibility with databases created from older migrations.
ALTER TABLE "user"
ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'Aluno';

ALTER TABLE person
ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'Aluno';

ALTER TABLE person
ADD COLUMN IF NOT EXISTS user_id INTEGER;

ALTER TABLE person
ALTER COLUMN cpf DROP NOT NULL;

ALTER TABLE person
ALTER COLUMN birth DROP NOT NULL;

-- Remove defaults after backfilling older rows.
ALTER TABLE "user"
ALTER COLUMN role DROP DEFAULT;

ALTER TABLE person
ALTER COLUMN role DROP DEFAULT;

-- Constraints for "user".
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'user_username_unique'
      AND conrelid = '"user"'::regclass
  ) THEN
    ALTER TABLE "user"
    ADD CONSTRAINT user_username_unique UNIQUE (username);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'user_role_check'
      AND conrelid = '"user"'::regclass
  ) THEN
    ALTER TABLE "user"
    ADD CONSTRAINT user_role_check CHECK (role IN ('Professor', 'Aluno', 'Administrador'));
  END IF;
END $$;

-- Constraints for person.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'person_role_check'
      AND conrelid = 'person'::regclass
  ) THEN
    ALTER TABLE person
    ADD CONSTRAINT person_role_check CHECK (role IN ('Professor', 'Aluno', 'Administrador'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'person_user_id_fk'
      AND conrelid = 'person'::regclass
  ) THEN
    ALTER TABLE person
    ADD CONSTRAINT person_user_id_fk
    FOREIGN KEY (user_id) REFERENCES "user"(id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'person_user_id_unique'
      AND conrelid = 'person'::regclass
  ) THEN
    ALTER TABLE person
    ADD CONSTRAINT person_user_id_unique UNIQUE (user_id);
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
WHERE conname IN (
  'user_username_unique',
  'user_role_check',
  'person_role_check',
  'person_user_id_fk',
  'person_user_id_unique'
)
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
