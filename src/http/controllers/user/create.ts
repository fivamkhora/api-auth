import { FastifyReply, FastifyRequest } from 'fastify'
import { hash } from 'bcryptjs'
import { z } from 'zod'

import { PersonRole } from '@/entities/models/person.interface'
import { Person } from '@/entities/person.entity'
import { User } from '@/entities/user.entity'
import { makeCreateUserUseCase } from '@/use-cases/factory/make-create-user-use-case'

export async function createUser(request: FastifyRequest, reply: FastifyReply) {
  const createUserBodySchema = z.object({
    username: z.string(),
    password: z.string(),
    role: z.nativeEnum(PersonRole),
    name: z.string(),
    email: z.string().email(),
    cpf: z.string().optional(),
    birth: z.coerce.date().optional(),
  })

  const { username, password, role, name, email, cpf, birth } =
    createUserBodySchema.parse(request.body)
  const passwordHash = await hash(password, 8)
  const createUserUseCase = makeCreateUserUseCase()
  const user = await createUserUseCase.handler(
    new User(username, passwordHash, role),
    new Person(cpf, name, birth, email, role),
  )

  return reply.status(201).send({
    id: user?.id,
    username: user?.username,
    role: user?.role,
    cpf: user?.cpf,
    name: user?.name,
    birth: user?.birth,
    email: user?.email,
    user_id: user?.user_id,
  })
}
