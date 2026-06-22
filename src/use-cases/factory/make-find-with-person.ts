import { UserRepository } from '@/repositories/typeorm/user.repository'
import { FindWithPersonUseCase } from '@/use-cases/find-with-person'

export function makeFindWithPersonUseCase(): FindWithPersonUseCase {
  const testUseCase = globalThis.__apiAuthTestUseCases?.findWithPerson

  if (testUseCase) {
    return testUseCase as FindWithPersonUseCase
  }

  const userRepository = new UserRepository()
  const findWithPersonUseCase = new FindWithPersonUseCase(userRepository)

  return findWithPersonUseCase
}
