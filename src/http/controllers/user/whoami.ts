import { FastifyReply, FastifyRequest } from 'fastify'

import { makeFindWithPersonUseCase } from '@/use-cases/factory/make-find-with-person'

export async function whoami(request: FastifyRequest, reply: FastifyReply) {
  const userId = Number(request.user.sub)

  if (Number.isNaN(userId)) {
    return reply.status(401).send({ message: 'Unauthorized' })
  }

  const findWithPersonUseCase = makeFindWithPersonUseCase()
  const user = await findWithPersonUseCase.handler(userId)

  return reply.status(200).send({
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    role: user.role,
  })
}
