import { FastifyInstance } from 'fastify'

import { createUser } from '@/http/controllers/user/create'
import { findAllUsers } from '@/http/controllers/user/find-all-users'
import { findManyUsers } from '@/http/controllers/user/find-many-users'
import { findUser } from '@/http/controllers/user/find-user'
import { signIn } from '@/http/controllers/user/sign-in'
import { whoami } from '@/http/controllers/user/whoami'
import {
  createUserSchema,
  findAllUsersSchema,
  findManyUsersSchema,
  findUserSchema,
  signInSchema,
  whoamiSchema,
} from '@/http/controllers/user/schemas'

export async function userRoutes(app: FastifyInstance) {
  app.get('/users', { schema: findManyUsersSchema }, findManyUsers)
  app.get('/user', { schema: findAllUsersSchema }, findAllUsers)
  app.get('/user/whoami', { schema: whoamiSchema }, whoami)
  app.get('/user/:identifier', { schema: findUserSchema }, findUser)
  app.post('/user', { schema: createUserSchema }, createUser)
  app.post('/user/signin', { schema: signInSchema }, signIn)
}
