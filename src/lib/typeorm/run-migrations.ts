import 'reflect-metadata'

import { appDataSource, initializeTypeORM } from '@/lib/typeorm/typeorm'

async function runMigrations() {
  await initializeTypeORM()

  await appDataSource.runMigrations()
  await appDataSource.destroy()

  console.log('TypeORM migrations executed')
}

runMigrations().catch((error: unknown) => {
  console.error('Error running TypeORM migrations', error)
  process.exit(1)
})
