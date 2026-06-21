import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateUserAndPersonTables1718580000000 implements MigrationInterface {
  name = 'CreateUserAndPersonTables1718580000000'

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user" (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
      )
    `)

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS person (
        id SERIAL PRIMARY KEY,
        cpf VARCHAR(20) NOT NULL,
        name VARCHAR(255) NOT NULL,
        birth DATE NOT NULL,
        email VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('Professor', 'Aluno')),
        user_id INTEGER REFERENCES "user"(id)
      )
    `)
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS person')
    await queryRunner.query('DROP TABLE IF EXISTS "user"')
  }
}

