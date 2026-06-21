import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeFindWithPersonUseCase } from '@/use-cases/factory/make-find-with-person'

export async function findUser(request: FastifyRequest, reply: FastifyReply) {
  const findUserParamsSchema = z.object({
    id: z.coerce.number(),
  })

  const { id } = findUserParamsSchema.parse(request.params)
  const findWithPersonUseCase = makeFindWithPersonUseCase()
  const user = await findWithPersonUseCase.handler(id)
  const { password: _password, ...userWithoutPassword } = user

  return reply.status(200).send(userWithoutPassword)
}
