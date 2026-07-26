import { FastifySchema } from 'fastify'

const roles = ['Aluno', 'Professor', 'Administrador']

const errorSchema = {
  type: 'object',
  properties: {
    message: { type: 'string' },
  },
  required: ['message'],
}

const validationErrorSchema = {
  type: 'object',
  properties: {
    message: { type: 'string' },
    issues: {
      type: 'object',
      additionalProperties: {
        type: 'array',
        items: { type: 'string' },
      },
    },
  },
  required: ['message'],
}

const userSchema = {
  type: 'object',
  description: 'Usuario sem senha ou outros dados sensiveis.',
  properties: {
    id: { type: 'integer' },
    username: { type: 'string' },
    role: { type: 'string', enum: roles },
    cpf: { type: 'string', nullable: true },
    name: { type: 'string', nullable: true },
    birth: {
      type: 'string',
      nullable: true,
      format: 'date',
    },
    email: {
      type: 'string',
      nullable: true,
      format: 'email',
    },
    user_id: { type: 'integer', nullable: true },
  },
  required: ['id', 'username', 'role'],
}

const protectedRoute = {
  security: [{ bearerAuth: [] }],
  response: {
    401: {
      ...errorSchema,
      description: 'Token ausente, invalido ou expirado.',
    },
  },
}

export const createUserSchema: FastifySchema = {
  tags: ['Usuarios'],
  summary: 'Criar usuario',
  description:
    'Cria o usuario e os dados de person na mesma transacao. A senha e armazenada como hash.',
  body: {
    type: 'object',
    additionalProperties: false,
    properties: {
      username: { type: 'string', minLength: 1 },
      password: {
        type: 'string',
        minLength: 1,
        writeOnly: true,
      },
      role: { type: 'string', enum: roles },
      name: { type: 'string', minLength: 1 },
      email: {
        type: 'string',
        format: 'email',
      },
      cpf: { type: 'string' },
      birth: { type: 'string', format: 'date' },
    },
    required: ['username', 'password', 'role', 'name', 'email'],
  },
  response: {
    201: {
      ...userSchema,
      description: 'Usuario criado.',
    },
    400: validationErrorSchema,
  },
}

export const signInSchema: FastifySchema = {
  tags: ['Autenticacao'],
  summary: 'Autenticar usuario',
  description:
    'Valida username e senha. O JWT retornado expira em 10 minutos.',
  body: {
    type: 'object',
    additionalProperties: false,
    properties: {
      username: { type: 'string', minLength: 1 },
      password: {
        type: 'string',
        minLength: 1,
        writeOnly: true,
      },
    },
    required: ['username', 'password'],
  },
  response: {
    200: {
      type: 'object',
      description: 'Autenticacao concluida.',
      properties: {
        token: { type: 'string', description: 'Token JWT.' },
        role: { type: 'string', enum: roles },
      },
      required: ['token', 'role'],
    },
    400: validationErrorSchema,
    401: {
      ...errorSchema,
      description: 'Credenciais invalidas.',
    },
  },
}

export const findAllUsersSchema: FastifySchema = {
  ...protectedRoute,
  tags: ['Usuarios'],
  summary: 'Listar usuarios',
  description:
    'Lista todos os usuarios. O filtro role e opcional. A resposta nunca inclui senha.',
  querystring: {
    type: 'object',
    additionalProperties: false,
    properties: {
      role: { type: 'string', enum: roles },
    },
  },
  response: {
    ...protectedRoute.response,
    200: {
      type: 'array',
      description: 'Usuarios encontrados.',
      items: userSchema,
    },
    400: validationErrorSchema,
  },
}

export const whoamiSchema: FastifySchema = {
  ...protectedRoute,
  tags: ['Autenticacao'],
  summary: 'Consultar usuario autenticado',
  description: 'Usa o sub do JWT para consultar o usuario atual.',
  response: {
    ...protectedRoute.response,
    200: {
      type: 'object',
      description: 'Identidade vinculada ao JWT.',
      properties: {
        id: { type: 'integer' },
        username: { type: 'string' },
        name: { type: 'string', nullable: true },
        email: { type: 'string', nullable: true, format: 'email' },
        role: { type: 'string', enum: roles },
      },
      required: ['id', 'username', 'name', 'email', 'role'],
    },
    404: errorSchema,
  },
}

export const findUserSchema: FastifySchema = {
  ...protectedRoute,
  tags: ['Usuarios'],
  summary: 'Buscar usuario por ID ou nome',
  description:
    'Um identifier numerico busca por ID e retorna um objeto. Um texto busca por nome parcial e retorna uma lista.',
  params: {
    type: 'object',
    properties: {
      identifier: {
        type: 'string',
        minLength: 1,
        description: 'ID numerico ou parte do nome da pessoa.',
      },
    },
    required: ['identifier'],
  },
  response: {
    ...protectedRoute.response,
    200: {
      description: 'Usuario por ID ou lista resultante da busca por nome.',
      oneOf: [userSchema, { type: 'array', items: userSchema }],
    },
    400: validationErrorSchema,
    404: errorSchema,
  },
}

export const findManyUsersSchema: FastifySchema = {
  ...protectedRoute,
  tags: ['Usuarios'],
  summary: 'Buscar multiplos usuarios',
  description:
    'Recebe ate 100 IDs positivos separados por virgula, remove duplicados e retorna somente usuarios encontrados.',
  querystring: {
    type: 'object',
    additionalProperties: false,
    properties: {
      ids: {
        type: 'string',
        minLength: 1,
        description: 'Lista de IDs separados por virgula.',
      },
    },
    required: ['ids'],
  },
  response: {
    ...protectedRoute.response,
    200: {
      type: 'array',
      description: 'Usuarios encontrados, sem campos sensiveis.',
      items: userSchema,
    },
    400: validationErrorSchema,
  },
}
