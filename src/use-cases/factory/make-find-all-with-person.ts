import { UserRepository } from '@/repositories/typeorm/user.repository'
import { FindAllWithPersonUseCase } from '@/use-cases/find-all-with-person'

export function makeFindAllWithPersonUseCase(): FindAllWithPersonUseCase {
  const testUseCase = globalThis.__apiAuthTestUseCases?.findAllWithPerson

  if (testUseCase) {
    return testUseCase as FindAllWithPersonUseCase
  }

  const userRepository = new UserRepository()
  const findAllWithPersonUseCase = new FindAllWithPersonUseCase(userRepository)

  return findAllWithPersonUseCase
}
