import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { ZodError } from 'zod'

import { env } from '@/env'
import { InvalidCredentialsError } from '@/use-cases/errors/invalid-credentials-error'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'

export function globalErrorHandler(
  error: FastifyError,
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  if (env.NODE_ENV === 'development') {
    console.error(error)
  }

  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: 'Validation error',
      issues: error.flatten().fieldErrors,
    })
  }

  if (error.validation) {
    const issues: Record<string, string[]> = {}

    for (const validationIssue of error.validation) {
      const missingProperty = validationIssue.params.missingProperty as
        | string
        | undefined
      const additionalProperty = validationIssue.params.additionalProperty as
        | string
        | undefined
      const pathProperty = validationIssue.instancePath
        .split('/')
        .filter(Boolean)
        .at(-1)
      const property =
        missingProperty ?? additionalProperty ?? pathProperty ?? 'request'

      issues[property] ??= []
      issues[property].push(validationIssue.message ?? 'Invalid value')
    }

    return reply.status(400).send({
      message: 'Validation error',
      issues,
    })
  }

  if (error instanceof ResourceNotFoundError) {
    return reply.status(404).send({ message: error.message })
  }

  if (error instanceof InvalidCredentialsError) {
    return reply.status(401).send({ message: error.message })
  }

  return reply.status(500).send({ message: 'Internal server error' })
}
