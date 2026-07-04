import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeFindWithPersonUseCase } from '@/use-cases/factory/make-find-with-person'

export async function findUser(request: FastifyRequest, reply: FastifyReply) {
  const findUserParamsSchema = z.object({
    identifier: z.string().trim().min(1),
  })

  const { identifier } = findUserParamsSchema.parse(request.params)
  const parsedIdentifier = Number(identifier)
  const findWithPersonUseCase = makeFindWithPersonUseCase()

  if (Number.isNaN(parsedIdentifier)) {
    const users = await findWithPersonUseCase.handler(identifier)
    const usersWithoutPassword = users.map(({ password: _password, ...user }) =>
      user,
    )

    return reply.status(200).send(usersWithoutPassword)
  }

  const user = await findWithPersonUseCase.handler(parsedIdentifier)
  const { password: _password, ...userWithoutPassword } = user

  return reply.status(200).send(userWithoutPassword)
}
