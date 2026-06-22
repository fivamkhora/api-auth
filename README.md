# API Auth

API de autenticacao e consulta de usuarios usando Fastify, TypeScript, JWT, TypeORM e PostgreSQL.

## Tecnologias

- Node.js
- TypeScript
- Fastify
- TypeORM
- PostgreSQL
- JWT
- Zod
- Bcrypt

## Requisitos

- Node.js 22 ou superior
- npm
- Docker e Docker Compose, se for usar o PostgreSQL via container

## Configuracao

Crie um arquivo `.env` na raiz do projeto com base no `.env.example`:

```env
PORT=3000
NODE_ENV=development
DATABASE_USER=postgres
DATABASE_HOST=localhost
DATABASE_NAME=api_auth
DATABASE_PASSWORD=postgres
DATABASE_PORT=5432
JWT_SECRET=segredo_local
```

Variaveis:

- `PORT`: porta HTTP da API.
- `NODE_ENV`: ambiente da aplicacao (`development`, `production` ou `test`).
- `DATABASE_USER`: usuario do PostgreSQL.
- `DATABASE_HOST`: host do PostgreSQL.
- `DATABASE_NAME`: nome do banco.
- `DATABASE_PASSWORD`: senha do banco.
- `DATABASE_PORT`: porta do PostgreSQL.
- `JWT_SECRET`: segredo usado para assinar os tokens JWT.

## Como Executar

Instale as dependencias:

```bash
npm install
```

Suba o banco com Docker Compose:

```bash
docker compose up -d
```

Execute as migrations:

```bash
npm run migration:run
```

Inicie a API em modo desenvolvimento:

```bash
npm run dev
```

A API ficara disponivel em:

```text
http://localhost:3000
```

## Scripts

- `npm run dev`: inicia a API com `tsx`.
- `npm run build`: compila o TypeScript para `dist`.
- `npm run migration:run`: executa as migrations do TypeORM.
- `npm test`: executa os testes em `test/app.test.js`.

## Docker

Build da imagem:

```bash
docker build -f docker/Dockerfile -t api-auth .
```

Executar a imagem:

```bash
docker run --env-file .env -p 3000:3000 api-auth
```

## Autenticacao

As rotas `POST /user` e `POST /user/signin` sao publicas.

As demais rotas exigem token JWT no header:

```http
Authorization: Bearer <token>
```

O token e gerado pela rota de login.

## Roles

Valores aceitos no campo `role`:

- `Aluno`
- `Professor`

## Endpoints

### Criar Usuario

```http
POST /user
```

Body:

```json
{
  "username": "maria",
  "password": "123456",
  "role": "Aluno"
}
```

Resposta `201`:

```json
{
  "id": 1,
  "username": "maria",
  "role": "Aluno"
}
```

Observacao: a senha e salva com hash e nao e retornada na resposta.

### Login

```http
POST /user/signin
```

Body:

```json
{
  "username": "maria",
  "password": "123456"
}
```

Resposta `200`:

```json
{
  "token": "<jwt>",
  "role": "Aluno"
}
```

Resposta `401` quando as credenciais forem invalidas:

```json
{
  "message": "Username or password is incorrect"
}
```

### Buscar Usuario

```http
GET /user/:id
```

Header:

```http
Authorization: Bearer <token>
```

Resposta `200`:

```json
{
  "id": 1,
  "username": "maria",
  "role": "Aluno",
  "cpf": "00000000000",
  "name": "Maria",
  "birth": "2000-01-01",
  "email": "maria@example.com",
  "user_id": 1
}
```

Resposta `401` sem token:

```json
{
  "message": "Unauthorized"
}
```

Resposta `404` quando o usuario nao existir:

```json
{
  "message": "Resource not found"
}
```

## Erros de Validacao

Quando o corpo ou parametros da requisicao forem invalidos, a API retorna `400`:

```json
{
  "message": "Validation error",
  "issues": {
    "field": ["mensagem do erro"]
  }
}
```

## Estrutura Principal

```text
src/
  app.ts                         # configuracao do Fastify
  server.ts                      # inicializacao HTTP e TypeORM
  env/                           # validacao das variaveis de ambiente
  entities/                      # entidades TypeORM
  http/controllers/user/         # rotas e controllers de usuario
  http/middlewares/              # middleware JWT
  lib/typeorm/                   # datasource e migrations
  repositories/                  # contratos e implementacoes
  use-cases/                     # regras de negocio
test/
  app.test.js                    # roteiro de testes da API
```
