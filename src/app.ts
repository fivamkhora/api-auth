import 'reflect-metadata'
import '@/lib/typeorm/typeorm'

import fastify from 'fastify'
import fastifyJwt from '@fastify/jwt'

import { env } from '@/env'
import { userRoutes } from '@/http/controllers/user/routes'
import { validateJWT } from '@/http/middlewares/jwt-validate'
import { globalErrorHandler } from '@/utils/global-error-handler'

export const app = fastify()

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
  sign: {
    expiresIn: '10m',
  },
})

app.addHook('onRequest', validateJWT)

app.register(userRoutes)

app.setErrorHandler(globalErrorHandler)
