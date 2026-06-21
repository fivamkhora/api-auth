import { FastifyReply, FastifyRequest } from 'fastify'

const publicRoutes = ['POST-/user', 'POST-/user/signin']

export async function validateJWT(request: FastifyRequest, reply: FastifyReply) {
  const routePath =
    request.url.split('?')[0].replace(/\/$/, '') || '/'
  const routeKey = `${request.method}-${routePath}`

  if (publicRoutes.includes(routeKey)) {
    return
  }

  try {
    await request.jwtVerify()
  } catch {
    return reply.status(401).send({ message: 'Unauthorized' })
  }
}
