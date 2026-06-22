import { app } from '@/app'
import { env } from '@/env'
import { initializeTypeORM } from '@/lib/typeorm/typeorm'

initializeTypeORM()
  .then(() =>
    app.listen({
      host: '0.0.0.0',
      port: env.PORT,
    }),
  )
  .then((address) => {
    console.log(`HTTP server running at ${address}`)
  })
