import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

import { SwaggerOptions } from '@fastify/swagger'
import { FastifyInstance } from 'fastify'

const nodeRequire = createRequire(__filename)
const swaggerUiPath = dirname(
  nodeRequire.resolve('swagger-ui-dist/package.json'),
)
const swaggerUiCss = readFileSync(join(swaggerUiPath, 'swagger-ui.css'))
const swaggerUiBundle = readFileSync(join(swaggerUiPath, 'swagger-ui-bundle.js'))
const swaggerUiPreset = readFileSync(
  join(swaggerUiPath, 'swagger-ui-standalone-preset.js'),
)

const swaggerInitializer = `
window.onload = () => {
  SwaggerUIBundle({
    url: '/docs/json',
    dom_id: '#swagger-ui',
    deepLinking: true,
    persistAuthorization: true,
    docExpansion: 'list',
    presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
    layout: 'StandaloneLayout'
  })
}
`

const swaggerHtml = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>API Auth - Swagger UI</title>
    <link rel="stylesheet" href="/docs/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="/docs/swagger-ui-bundle.js"></script>
    <script src="/docs/swagger-ui-standalone-preset.js"></script>
    <script src="/docs/swagger-initializer.js"></script>
  </body>
</html>`

const contentSecurityPolicy = [
  "default-src 'self'",
  "img-src 'self' data:",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
].join('; ')

export const swaggerOptions: SwaggerOptions = {
  openapi: {
    openapi: '3.0.3',
    info: {
      title: 'API Auth',
      description:
        'API para cadastro, autenticacao e consulta de usuarios. Use o token retornado pelo login no botao Authorize para acessar os metodos protegidos.',
      version: '1.0.0',
    },
    tags: [
      {
        name: 'Autenticacao',
        description: 'Login e identificacao do usuario autenticado.',
      },
      {
        name: 'Usuarios',
        description: 'Cadastro e consultas de usuarios.',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Informe o JWT retornado por POST /user/signin.',
        },
      },
    },
  },
}

export async function swaggerUiRoutes(app: FastifyInstance) {
  app.get('/docs', async (_, reply) => reply.redirect('/docs/'))

  app.get('/docs/', async (_, reply) => {
    return reply
      .header('content-security-policy', contentSecurityPolicy)
      .type('text/html; charset=utf-8')
      .send(swaggerHtml)
  })

  app.get('/docs/json', async (_, reply) => reply.send(app.swagger()))
  app.get('/docs/yaml', async (_, reply) => {
    return reply.type('application/yaml').send(app.swagger({ yaml: true }))
  })

  app.get('/docs/swagger-ui.css', async (_, reply) => {
    return reply.type('text/css; charset=utf-8').send(swaggerUiCss)
  })

  app.get('/docs/swagger-ui-bundle.js', async (_, reply) => {
    return reply.type('application/javascript').send(swaggerUiBundle)
  })

  app.get('/docs/swagger-ui-standalone-preset.js', async (_, reply) => {
    return reply.type('application/javascript').send(swaggerUiPreset)
  })

  app.get('/docs/swagger-initializer.js', async (_, reply) => {
    return reply.type('application/javascript').send(swaggerInitializer)
  })
}
