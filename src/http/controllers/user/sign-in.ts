import { compare } from 'bcryptjs'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { InvalidCredentialsError } from '@/use-cases/errors/invalid-credentials-error'
import { makeSignInUseCase } from '@/use-cases/factory/make-sign-in-use-case'

export async function signIn(request: FastifyRequest, reply: FastifyReply) {
  const signInBodySchema = z.object({
    username: z.string(),
    password: z.string(),
  })

  const { username, password } = signInBodySchema.parse(request.body)
  const signInUseCase = makeSignInUseCase()
  const user = await signInUseCase.handler(username)
  const doesPasswordMatch = await compare(password, user.password)

  if (!doesPasswordMatch) {
    throw new InvalidCredentialsError()
  }

  const token = await reply.jwtSign(
    { username, role: user.role },
    { sign: { sub: String(user.id) } },
  )

  return reply.status(200).send({ token, role: user.role })
}
