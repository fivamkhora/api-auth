import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { PersonRole } from '@/entities/models/person.interface'
import { makeFindAllWithPersonUseCase } from '@/use-cases/factory/make-find-all-with-person'

export async function findAllUsers(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const querySchema = z.object({
    role: z.nativeEnum(PersonRole).optional(),
  })
  const { role } = querySchema.parse(request.query)
  const findAllWithPersonUseCase = makeFindAllWithPersonUseCase()
  const users = await findAllWithPersonUseCase.handler(role)
  const usersWithoutSensitiveFields = users.map(
    ({ password: _password, ...user }) => user,
  )

  return reply.status(200).send(usersWithoutSensitiveFields)
}
