import { MigrationInterface, QueryRunner } from 'typeorm'

export class MakePersonCpfBirthNullable1783123200000
  implements MigrationInterface
{
  name = 'MakePersonCpfBirthNullable1783123200000'

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE person ALTER COLUMN cpf DROP NOT NULL')
    await queryRunner.query('ALTER TABLE person ALTER COLUMN birth DROP NOT NULL')
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE person ALTER COLUMN cpf SET NOT NULL')
    await queryRunner.query('ALTER TABLE person ALTER COLUMN birth SET NOT NULL')
  }
}