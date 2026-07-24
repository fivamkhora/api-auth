import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddAdminRole1784851200000 implements MigrationInterface {
  name = 'AddAdminRole1784851200000'

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user"
      DROP CONSTRAINT IF EXISTS user_role_check
    `)

    await queryRunner.query(`
      ALTER TABLE "user"
      ADD CONSTRAINT user_role_check
      CHECK (role IN ('Professor', 'Aluno', 'Administrador'))
    `)

    await queryRunner.query(`
      ALTER TABLE person
      DROP CONSTRAINT IF EXISTS person_role_check
    `)

    await queryRunner.query(`
      ALTER TABLE person
      ADD CONSTRAINT person_role_check
      CHECK (role IN ('Professor', 'Aluno', 'Administrador'))
    `)
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user"
      DROP CONSTRAINT IF EXISTS user_role_check
    `)

    await queryRunner.query(`
      ALTER TABLE "user"
      ADD CONSTRAINT user_role_check
      CHECK (role IN ('Professor', 'Aluno'))
    `)

    await queryRunner.query(`
      ALTER TABLE person
      DROP CONSTRAINT IF EXISTS person_role_check
    `)

    await queryRunner.query(`
      ALTER TABLE person
      ADD CONSTRAINT person_role_check
      CHECK (role IN ('Professor', 'Aluno'))
    `)
  }
}