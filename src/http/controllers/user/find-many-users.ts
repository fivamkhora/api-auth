import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeFindManyWithPersonUseCase } from '@/use-cases/factory/make-find-many-with-person'

const MAX_BATCH_IDS = 100

export async function findManyUsers(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const querySchema = z.object({
    ids: z.string().trim().min(1),
  })
  const { ids } = querySchema.parse(request.query)
  const parsedIds = ids.split(',').map((id) => id.trim())
  const invalidId = parsedIds.find((id) => {
    if (!/^\d+$/.test(id)) {
      return true
    }

    return Number(id) <= 0
  })

  if (invalidId) {
    return reply.status(400).send({
      message: 'Validation error',
      issues: {
        ids: ['ids must contain only positive numeric values separated by comma'],
      },
    })
  }

  const uniqueIds = Array.from(
    new Set(parsedIds.map((id) => Number(id))),
  )

  if (uniqueIds.length === 0) {
    return reply.status(400).send({
      message: 'Validation error',
      issues: {
        ids: ['ids must contain at least one positive numeric value'],
      },
    })
  }

  if (uniqueIds.length > MAX_BATCH_IDS) {
    return reply.status(400).send({
      message: 'Validation error',
      issues: {
        ids: [`ids must contain at most ${MAX_BATCH_IDS} values`],
      },
    })
  }

  const findManyWithPersonUseCase = makeFindManyWithPersonUseCase()
  const users = await findManyWithPersonUseCase.handler(uniqueIds)
  const usersWithoutSensitiveFields = users.map(
    ({ password: _password, ...user }) => user,
  )

  return reply.status(200).send(usersWithoutSensitiveFields)
}
