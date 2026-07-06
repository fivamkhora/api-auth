import { FastifyReply, FastifyRequest } from 'fastify'

import { makeFindAllWithPersonUseCase } from '@/use-cases/factory/make-find-all-with-person'

export async function findAllUsers(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  const findAllWithPersonUseCase = makeFindAllWithPersonUseCase()
  const users = await findAllWithPersonUseCase.handler()
  const usersWithoutSensitiveFields = users.map(
    ({ password: _password, ...user }) => user,
  )

  return reply.status(200).send(usersWithoutSensitiveFields)
}
