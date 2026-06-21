import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddRoleToPersonTable1718666400000 implements MigrationInterface {
  name = 'AddRoleToPersonTable1718666400000'

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE person
      ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'Aluno'
    `)

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'person_role_check'
            AND conrelid = 'person'::regclass
        ) THEN
          ALTER TABLE person
          ADD CONSTRAINT person_role_check CHECK (role IN ('Professor', 'Aluno'));
        END IF;
      END $$;
    `)

    await queryRunner.query(`
      ALTER TABLE person
      ALTER COLUMN role DROP DEFAULT
    `)
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE person
      DROP CONSTRAINT IF EXISTS person_role_check
    `)

    await queryRunner.query(`
      ALTER TABLE person
      DROP COLUMN IF EXISTS role
    `)
  }
}
