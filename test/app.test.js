const assert = require('node:assert/strict')
const { after, before, beforeEach, describe, it } = require('node:test')

const { hash } = require('bcryptjs')

process.env.PORT = process.env.PORT ?? '3333'
process.env.NODE_ENV = 'test'
process.env.DATABASE_USER = process.env.DATABASE_USER ?? 'test'
process.env.DATABASE_HOST = process.env.DATABASE_HOST ?? 'localhost'
process.env.DATABASE_NAME = process.env.DATABASE_NAME ?? 'api_auth_test'
process.env.DATABASE_PASSWORD = process.env.DATABASE_PASSWORD ?? 'test'
process.env.DATABASE_PORT = process.env.DATABASE_PORT ?? '5432'
process.env.JWT_SECRET = process.env.SECRET ?? process.env.JWT_SECRET ?? 'segredo_ci_test'

const mocks = {
  createUser: { handler: async () => undefined },
  signIn: { handler: async () => undefined },
  findAllWithPerson: { handler: async () => undefined },
  findWithPerson: { handler: async () => undefined },
  findManyWithPerson: { handler: async () => undefined },
}

globalThis.__apiAuthTestUseCases = mocks

const { PersonRole } = require('../src/entities/models/person.interface')
const {
  InvalidCredentialsError,
} = require('../src/use-cases/errors/invalid-credentials-error')
const {
  ResourceNotFoundError,
} = require('../src/use-cases/errors/resource-not-found-error')
const { app } = require('../src/app')

describe('API Auth', () => {
  before(async () => {
    await app.ready()
  })

  beforeEach(() => {
    mocks.createUser.handler = async () => undefined
    mocks.signIn.handler = async () => undefined
    mocks.findAllWithPerson.handler = async () => undefined
    mocks.findWithPerson.handler = async () => undefined
    mocks.findManyWithPerson.handler = async () => undefined
  })

  after(async () => {
    delete globalThis.__apiAuthTestUseCases
    await app.close()
  })

  it('creates a user and does not expose the password', async () => {
    mocks.createUser.handler = async (user, person) => ({
      id: 1,
      username: user.username,
      password: user.password,
      role: user.role,
      cpf: person.cpf,
      name: person.name,
      birth: person.birth,
      email: person.email,
      user_id: 1,
    })

    const response = await app.inject({
      method: 'POST',
      url: '/user',
      payload: {
        username: 'maria',
        password: '123456',
        role: PersonRole.ALUNO,
        name: 'Maria',
        email: 'maria@example.com',
      },
    })
    const body = response.json()

    assert.equal(response.statusCode, 201)
    assert.deepEqual(body, {
      id: 1,
      username: 'maria',
      role: PersonRole.ALUNO,
      name: 'Maria',
      email: 'maria@example.com',
      user_id: 1,
    })
  })

  it('requires name and email to create a user', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/user',
      payload: {
        username: 'maria',
        password: '123456',
        role: PersonRole.ALUNO,
      },
    })
    const body = response.json()

    assert.equal(response.statusCode, 400)
    assert.equal(body.message, 'Validation error')
    assert.ok(body.issues.name)
    assert.ok(body.issues.email)
  })

  it('signs in with valid credentials', async () => {
    mocks.signIn.handler = async () => ({
      id: 1,
      username: 'maria',
      password: await hash('123456', 8),
      role: PersonRole.ALUNO,
      cpf: '00000000000',
      name: 'Maria',
      birth: new Date('2000-01-01'),
      email: 'maria@example.com',
      user_id: 1,
    })

    const response = await app.inject({
      method: 'POST',
      url: '/user/signin',
      payload: {
        username: 'maria',
        password: '123456',
      },
    })
    const body = response.json()

    assert.equal(response.statusCode, 200)
    assert.deepEqual(Object.keys(body).sort(), ['role', 'token'])
    assert.equal(body.role, PersonRole.ALUNO)
    assert.equal(typeof body.token, 'string')
    assert.ok(body.token.length > 0)
  })

  it('rejects invalid credentials', async () => {
    mocks.signIn.handler = async () => ({
      id: 1,
      username: 'maria',
      password: await hash('senha-correta', 8),
      role: PersonRole.ALUNO,
    })

    const response = await app.inject({
      method: 'POST',
      url: '/user/signin',
      payload: {
        username: 'maria',
        password: 'senha-errada',
      },
    })
    const body = response.json()

    assert.equal(response.statusCode, 401)
    assert.deepEqual(body, {
      message: new InvalidCredentialsError().message,
    })
  })

  it('protects the user lookup route', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/user/1',
    })
    const body = response.json()

    assert.equal(response.statusCode, 401)
    assert.deepEqual(body, { message: 'Unauthorized' })
  })

  it('lists authenticated users without exposing passwords', async () => {
    mocks.findAllWithPerson.handler = async () => [
      {
        id: 1,
        username: 'maria',
        password: 'hashed-password',
        role: PersonRole.ALUNO,
        cpf: '00000000000',
        name: 'Maria',
        birth: new Date('2000-01-01'),
        email: 'maria@example.com',
        user_id: 1,
      },
      {
        id: 2,
        username: 'joao',
        password: 'hashed-password',
        role: PersonRole.PROFESSOR,
        cpf: '11111111111',
        name: 'Joao',
        birth: new Date('1980-01-01'),
        email: 'joao@example.com',
        user_id: 2,
      },
    ]
    const token = app.jwt.sign(
      { username: 'maria', role: PersonRole.ALUNO },
      { sub: '1' },
    )

    const response = await app.inject({
      method: 'GET',
      url: '/user',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })
    const body = response.json()

    assert.equal(response.statusCode, 200)
    assert.equal(body.length, 2)
    assert.equal(body[0].username, 'maria')
    assert.equal(body[0].password, undefined)
    assert.equal(body[1].username, 'joao')
    assert.equal(body[1].password, undefined)
  })

  it('lists authenticated users filtered by role', async () => {
    let receivedRole
    mocks.findAllWithPerson.handler = async (role) => {
      receivedRole = role

      return [
        {
          id: 2,
          username: 'joao',
          password: 'hashed-password',
          role: PersonRole.PROFESSOR,
          name: 'Joao',
          email: 'joao@example.com',
          user_id: 2,
        },
      ]
    }
    const token = app.jwt.sign(
      { username: 'maria', role: PersonRole.ALUNO },
      { sub: '1' },
    )

    const response = await app.inject({
      method: 'GET',
      url: '/user?role=Professor',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })
    const body = response.json()

    assert.equal(response.statusCode, 200)
    assert.equal(receivedRole, PersonRole.PROFESSOR)
    assert.equal(body.length, 1)
    assert.equal(body[0].role, PersonRole.PROFESSOR)
    assert.equal(body[0].password, undefined)
  })

  it('lists authenticated users filtered by admin role', async () => {
    let receivedRole
    mocks.findAllWithPerson.handler = async (role) => {
      receivedRole = role

      return [
        {
          id: 3,
          username: 'admin',
          password: 'hashed-password',
          role: PersonRole.ADMIN,
          name: 'Admin',
          email: 'admin@example.com',
          user_id: 3,
        },
      ]
    }
    const token = app.jwt.sign(
      { username: 'maria', role: PersonRole.ALUNO },
      { sub: '1' },
    )

    const response = await app.inject({
      method: 'GET',
      url: '/user?role=Administrador',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })
    const body = response.json()

    assert.equal(response.statusCode, 200)
    assert.equal(receivedRole, PersonRole.ADMIN)
    assert.equal(body.length, 1)
    assert.equal(body[0].role, PersonRole.ADMIN)
    assert.equal(body[0].password, undefined)
  })

  it('rejects an invalid role when listing users', async () => {
    const token = app.jwt.sign(
      { username: 'maria', role: PersonRole.ALUNO },
      { sub: '1' },
    )

    const response = await app.inject({
      method: 'GET',
      url: '/user?role=Coordenador',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    assert.equal(response.statusCode, 400)
  })

  it('protects the user list route', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/user',
    })
    const body = response.json()

    assert.equal(response.statusCode, 401)
    assert.deepEqual(body, { message: 'Unauthorized' })
  })

  it('finds an authenticated user without exposing the password', async () => {
    mocks.findWithPerson.handler = async () => ({
      id: 1,
      username: 'maria',
      password: 'hashed-password',
      role: PersonRole.ALUNO,
      cpf: '00000000000',
      name: 'Maria',
      birth: new Date('2000-01-01'),
      email: 'maria@example.com',
      user_id: 1,
    })
    const token = app.jwt.sign(
      { username: 'maria', role: PersonRole.ALUNO },
      { sub: '1' },
    )

    const response = await app.inject({
      method: 'GET',
      url: '/user/1',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })
    const body = response.json()

    assert.equal(response.statusCode, 200)
    assert.equal(body.id, 1)
    assert.equal(body.username, 'maria')
    assert.equal(body.role, PersonRole.ALUNO)
    assert.equal(body.email, 'maria@example.com')
    assert.equal(body.password, undefined)
  })

  it('returns the authenticated user profile', async () => {
    let receivedIdentifier
    mocks.findWithPerson.handler = async (identifier) => {
      receivedIdentifier = identifier

      return {
        id: 1,
        username: 'maria',
        password: 'hashed-password',
        role: PersonRole.ALUNO,
        cpf: '00000000000',
        name: 'Maria',
        birth: new Date('2000-01-01'),
        email: 'maria@example.com',
        user_id: 1,
      }
    }
    const token = app.jwt.sign(
      { username: 'maria', role: PersonRole.ALUNO },
      { sub: '1' },
    )

    const response = await app.inject({
      method: 'GET',
      url: '/user/whoami',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })
    const body = response.json()

    assert.equal(response.statusCode, 200)
    assert.equal(receivedIdentifier, 1)
    assert.deepEqual(body, {
      id: 1,
      username: 'maria',
      name: 'Maria',
      email: 'maria@example.com',
      role: PersonRole.ALUNO,
    })
  })

  it('finds many authenticated users by ids without exposing passwords', async () => {
    let receivedIds
    mocks.findManyWithPerson.handler = async (ids) => {
      receivedIds = ids

      return [
        {
          id: 10,
          username: 'joao.professor',
          password: 'hashed-password',
          role: PersonRole.PROFESSOR,
          name: 'Joao Professor Exemplo',
          email: 'joao.professor@example.com',
          user_id: 10,
        },
        {
          id: 25,
          username: 'jose.aluno',
          password: 'hashed-password',
          role: PersonRole.ALUNO,
          name: 'Jose Aluno Exemplo',
          email: 'jose.aluno@example.com',
          user_id: 25,
        },
      ]
    }
    const token = app.jwt.sign(
      { username: 'maria', role: PersonRole.ALUNO },
      { sub: '1' },
    )

    const response = await app.inject({
      method: 'GET',
      url: '/users?ids=10,25,10,30',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })
    const body = response.json()

    assert.equal(response.statusCode, 200)
    assert.deepEqual(receivedIds, [10, 25, 30])
    assert.equal(body.length, 2)
    assert.equal(body[0].id, 10)
    assert.equal(body[0].name, 'Joao Professor Exemplo')
    assert.equal(body[0].password, undefined)
    assert.equal(body[1].id, 25)
    assert.equal(body[1].name, 'Jose Aluno Exemplo')
    assert.equal(body[1].password, undefined)
  })

  it('requires ids to find many users', async () => {
    const token = app.jwt.sign(
      { username: 'maria', role: PersonRole.ALUNO },
      { sub: '1' },
    )

    const response = await app.inject({
      method: 'GET',
      url: '/users',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })
    const body = response.json()

    assert.equal(response.statusCode, 400)
    assert.equal(body.message, 'Validation error')
    assert.ok(body.issues.ids)
  })

  it('protects the batch user lookup route', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/users?ids=10,25',
    })
    const body = response.json()

    assert.equal(response.statusCode, 401)
    assert.deepEqual(body, { message: 'Unauthorized' })
  })

  it('rejects invalid ids when finding many users', async () => {
    const token = app.jwt.sign(
      { username: 'maria', role: PersonRole.ALUNO },
      { sub: '1' },
    )

    const response = await app.inject({
      method: 'GET',
      url: '/users?ids=10,abc,0',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })
    const body = response.json()

    assert.equal(response.statusCode, 400)
    assert.equal(body.message, 'Validation error')
    assert.ok(body.issues.ids)
  })

  it('limits the amount of ids when finding many users', async () => {
    const token = app.jwt.sign(
      { username: 'maria', role: PersonRole.ALUNO },
      { sub: '1' },
    )
    const ids = Array.from({ length: 101 }, (_, index) => index + 1).join(',')

    const response = await app.inject({
      method: 'GET',
      url: `/users?ids=${ids}`,
      headers: {
        authorization: `Bearer ${token}`,
      },
    })
    const body = response.json()

    assert.equal(response.statusCode, 400)
    assert.equal(body.message, 'Validation error')
    assert.ok(body.issues.ids)
  })

  it('finds authenticated users by partial name without exposing passwords', async () => {
    let receivedIdentifier
    mocks.findWithPerson.handler = async (identifier) => {
      receivedIdentifier = identifier

      return [
        {
          id: 1,
          username: 'maria',
          password: 'hashed-password',
          role: PersonRole.ALUNO,
          cpf: '00000000000',
          name: 'Maria Silva',
          birth: new Date('2000-01-01'),
          email: 'maria@example.com',
          user_id: 1,
        },
        {
          id: 2,
          username: 'mario',
          password: 'hashed-password',
          role: PersonRole.ALUNO,
          cpf: '11111111111',
          name: 'Mario Souza',
          birth: new Date('2001-01-01'),
          email: 'mario@example.com',
          user_id: 2,
        },
      ]
    }
    const token = app.jwt.sign(
      { username: 'maria', role: PersonRole.ALUNO },
      { sub: '1' },
    )

    const response = await app.inject({
      method: 'GET',
      url: '/user/Mari',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })
    const body = response.json()

    assert.equal(response.statusCode, 200)
    assert.equal(receivedIdentifier, 'Mari')
    assert.equal(body.length, 2)
    assert.equal(body[0].username, 'maria')
    assert.equal(body[0].name, 'Maria Silva')
    assert.equal(body[0].password, undefined)
    assert.equal(body[1].username, 'mario')
    assert.equal(body[1].name, 'Mario Souza')
    assert.equal(body[1].password, undefined)
  })

  it('returns 404 when an authenticated user does not exist', async () => {
    mocks.findWithPerson.handler = async () => {
      throw new ResourceNotFoundError()
    }
    const token = app.jwt.sign(
      { username: 'maria', role: PersonRole.ALUNO },
      { sub: '1' },
    )

    const response = await app.inject({
      method: 'GET',
      url: '/user/999',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })
    const body = response.json()

    assert.equal(response.statusCode, 404)
    assert.deepEqual(body, {
      message: new ResourceNotFoundError().message,
    })
  })
})
