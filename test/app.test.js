const assert = require('node:assert/strict')
const { after, before, beforeEach, describe, it } = require('node:test')

const { hash } = require('bcryptjs')
const mockRequire = require('mock-require')
const request = require('supertest')

process.env.PORT = process.env.PORT ?? '3333'
process.env.NODE_ENV = 'test'
process.env.DATABASE_USER = process.env.DATABASE_USER ?? 'test'
process.env.DATABASE_HOST = process.env.DATABASE_HOST ?? 'localhost'
process.env.DATABASE_NAME = process.env.DATABASE_NAME ?? 'api_auth_test'
process.env.DATABASE_PASSWORD = process.env.DATABASE_PASSWORD ?? 'test'
process.env.DATABASE_PORT = process.env.DATABASE_PORT ?? '5432'
process.env.JWT_SECRET = process.env.SECRET ?? process.env.JWT_SECRET ?? 'segredo_ci_test'

const mocks = {
  createUserHandler: async () => undefined,
  signInHandler: async () => undefined,
  findWithPersonHandler: async () => undefined,
}

mockRequire('@/use-cases/factory/make-create-user-use-case', {
  makeCreateUserUseCase: () => ({
    handler: mocks.createUserHandler,
  }),
})

mockRequire('@/use-cases/factory/make-sign-in-use-case', {
  makeSignInUseCase: () => ({
    handler: mocks.signInHandler,
  }),
})

mockRequire('@/use-cases/factory/make-find-with-person', {
  makeFindWithPersonUseCase: () => ({
    handler: mocks.findWithPersonHandler,
  }),
})

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
    mocks.createUserHandler = async () => undefined
    mocks.signInHandler = async () => undefined
    mocks.findWithPersonHandler = async () => undefined
  })

  after(async () => {
    mockRequire.stopAll()
    await app.close()
  })

  it('creates a user and does not expose the password', async () => {
    mocks.createUserHandler = async (user) => ({
      id: 1,
      username: user.username,
      password: user.password,
      role: user.role,
    })

    const response = await request(app.server).post('/user').send({
      username: 'maria',
      password: '123456',
      role: PersonRole.ALUNO,
    })

    assert.equal(response.status, 201)
    assert.deepEqual(response.body, {
      id: 1,
      username: 'maria',
      role: PersonRole.ALUNO,
    })
  })

  it('signs in with valid credentials', async () => {
    mocks.signInHandler = async () => ({
      id: 1,
      username: 'maria',
      password: await hash('123456', 8),
      role: PersonRole.ALUNO,
    })

    const response = await request(app.server).post('/user/signin').send({
      username: 'maria',
      password: '123456',
    })

    assert.equal(response.status, 200)
    assert.equal(response.body.role, PersonRole.ALUNO)
    assert.equal(typeof response.body.token, 'string')
    assert.ok(response.body.token.length > 0)
  })

  it('rejects invalid credentials', async () => {
    mocks.signInHandler = async () => ({
      id: 1,
      username: 'maria',
      password: await hash('senha-correta', 8),
      role: PersonRole.ALUNO,
    })

    const response = await request(app.server).post('/user/signin').send({
      username: 'maria',
      password: 'senha-errada',
    })

    assert.equal(response.status, 401)
    assert.deepEqual(response.body, {
      message: new InvalidCredentialsError().message,
    })
  })

  it('protects the user lookup route', async () => {
    const response = await request(app.server).get('/user/1')

    assert.equal(response.status, 401)
    assert.deepEqual(response.body, { message: 'Unauthorized' })
  })

  it('finds an authenticated user without exposing the password', async () => {
    mocks.findWithPersonHandler = async () => ({
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

    const response = await request(app.server)
      .get('/user/1')
      .set('Authorization', `Bearer ${token}`)

    assert.equal(response.status, 200)
    assert.equal(response.body.id, 1)
    assert.equal(response.body.username, 'maria')
    assert.equal(response.body.role, PersonRole.ALUNO)
    assert.equal(response.body.email, 'maria@example.com')
    assert.equal(response.body.password, undefined)
  })

  it('returns 404 when an authenticated user does not exist', async () => {
    mocks.findWithPersonHandler = async () => {
      throw new ResourceNotFoundError()
    }
    const token = app.jwt.sign(
      { username: 'maria', role: PersonRole.ALUNO },
      { sub: '1' },
    )

    const response = await request(app.server)
      .get('/user/999')
      .set('Authorization', `Bearer ${token}`)

    assert.equal(response.status, 404)
    assert.deepEqual(response.body, {
      message: new ResourceNotFoundError().message,
    })
  })
})
