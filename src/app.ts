import 'reflect-metadata'

import fastify from 'fastify'
import fastifyJwt from '@fastify/jwt'
import fastifySwagger from '@fastify/swagger'

import { env } from '@/env'
import { userRoutes } from '@/http/controllers/user/routes'
import { swaggerOptions, swaggerUiRoutes } from '@/http/docs/swagger'
import { validateJWT } from '@/http/middlewares/jwt-validate'
import { globalErrorHandler } from '@/utils/global-error-handler'

export const app = fastify({
  ajv: {
    customOptions: {
      allErrors: true,
    },
  },
})

app.register(fastifySwagger, swaggerOptions)
app.register(swaggerUiRoutes)

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
  sign: {
    expiresIn: '10m',
  },
})

app.addHook('onRequest', validateJWT)

app.register(userRoutes)

app.setErrorHandler(globalErrorHandler)
