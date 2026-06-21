import { FastifyInstance } from 'fastify'

import { createUser } from '@/http/controllers/user/create'
import { findUser } from '@/http/controllers/user/find-user'
import { signIn } from '@/http/controllers/user/sign-in'

export async function userRoutes(app: FastifyInstance) {
  app.get('/user/:id', findUser)
  app.post('/user', createUser)
  app.post('/user/signin', signIn)
}
