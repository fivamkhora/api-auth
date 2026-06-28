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
    person: z
      .object({
        cpf: z.string(),
        name: z.string(),
        birth: z.coerce.date(),
        email: z.string().email(),
      })
      .optional(),
  })

  const { username, password, role, person } = createUserBodySchema.parse(
    request.body,
  )
  const passwordHash = await hash(password, 8)
  const createUserUseCase = makeCreateUserUseCase()
  const user = await createUserUseCase.handler(
    new User(username, passwordHash, role),
    person
      ? new Person(person.cpf, person.name, person.birth, person.email, role)
      : undefined,
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
