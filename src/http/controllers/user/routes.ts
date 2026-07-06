import { FastifyInstance } from 'fastify'

import { createUser } from '@/http/controllers/user/create'
import { findAllUsers } from '@/http/controllers/user/find-all-users'
import { findManyUsers } from '@/http/controllers/user/find-many-users'
import { findUser } from '@/http/controllers/user/find-user'
import { signIn } from '@/http/controllers/user/sign-in'
import { whoami } from '@/http/controllers/user/whoami'

export async function userRoutes(app: FastifyInstance) {
  app.get('/users', findManyUsers)
  app.get('/user', findAllUsers)
  app.get('/user/whoami', whoami)
  app.get('/user/:identifier', findUser)
  app.post('/user', createUser)
  app.post('/user/signin', signIn)
}
