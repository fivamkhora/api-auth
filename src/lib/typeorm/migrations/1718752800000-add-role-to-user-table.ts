import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddRoleToUserTable1718752800000 implements MigrationInterface {
  name = 'AddRoleToUserTable1718752800000'

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user"
      ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'Aluno'
    `)

    await queryRunner.query(`
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
    `)

    await queryRunner.query(`
      ALTER TABLE "user"
      ALTER COLUMN role DROP DEFAULT
    `)
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user"
      DROP CONSTRAINT IF EXISTS user_role_check
    `)

    await queryRunner.query(`
      ALTER TABLE "user"
      DROP COLUMN IF EXISTS role
    `)
  }
}
