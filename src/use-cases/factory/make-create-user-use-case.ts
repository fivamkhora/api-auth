import { UserRepository } from '@/repositories/typeorm/user.repository'
import { CreateUserUseCase } from '@/use-cases/create-user'

export function makeCreateUserUseCase(): CreateUserUseCase {
  const testUseCase = globalThis.__apiAuthTestUseCases?.createUser

  if (testUseCase) {
    return testUseCase as CreateUserUseCase
  }

  const userRepository = new UserRepository()
  const createUserUseCase = new CreateUserUseCase(userRepository)

  return createUserUseCase
}
