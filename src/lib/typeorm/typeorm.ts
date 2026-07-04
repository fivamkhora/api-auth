import { DataSource } from 'typeorm'

import { Person } from '@/entities/person.entity'
import { User } from '@/entities/user.entity'
import { env } from '@/env'
import { CreateUserAndPersonTables1718580000000 } from '@/lib/typeorm/migrations/1718580000000-create-user-and-person-tables'
import { AddRoleToPersonTable1718666400000 } from '@/lib/typeorm/migrations/1718666400000-add-role-to-person-table'
import { AddRoleToUserTable1718752800000 } from '@/lib/typeorm/migrations/1718752800000-add-role-to-user-table'
import { MakePersonCpfBirthNullable1783123200000 } from '@/lib/typeorm/migrations/1783123200000-make-person-cpf-birth-nullable'

export const appDataSource = new DataSource({
  type: 'postgres',
  host: env.DATABASE_HOST,
  port: env.DATABASE_PORT,
  username: env.DATABASE_USER,
  password: env.DATABASE_PASSWORD,
  database: env.DATABASE_NAME,
  entities: [User, Person],
  migrations: [
    CreateUserAndPersonTables1718580000000,
    AddRoleToPersonTable1718666400000,
    AddRoleToUserTable1718752800000,
    MakePersonCpfBirthNullable1783123200000,
  ],
  logging: env.NODE_ENV === 'development',
})

export async function initializeTypeORM() {
  if (appDataSource.isInitialized) {
    return appDataSource
  }

  try {
    await appDataSource.initialize()
    console.log('TypeORM connection initialized')

    return appDataSource
  } catch (error: unknown) {
    console.error('Error during TypeORM connection initialization', error)

    throw error
  }
}
