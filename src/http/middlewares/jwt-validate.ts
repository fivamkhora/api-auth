import { FastifyReply, FastifyRequest } from 'fastify'

const publicRoutes = ['POST-/user', 'POST-/user/signin']
const publicRoutePrefixes = ['/docs']

export async function validateJWT(request: FastifyRequest, reply: FastifyReply) {
  const routePath =
    request.url.split('?')[0].replace(/\/$/, '') || '/'
  const routeKey = `${request.method}-${routePath}`

  const isPublicPrefix = publicRoutePrefixes.some(
    (prefix) => routePath === prefix || routePath.startsWith(`${prefix}/`),
  )

  if (publicRoutes.includes(routeKey) || isPublicPrefix) {
    return
  }

  try {
    await request.jwtVerify()
  } catch {
    return reply.status(401).send({ message: 'Unauthorized' })
  }
}
