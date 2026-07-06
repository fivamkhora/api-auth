import { UserRepository } from '@/repositories/typeorm/user.repository'
import { FindManyWithPersonUseCase } from '@/use-cases/find-many-with-person'

export function makeFindManyWithPersonUseCase(): FindManyWithPersonUseCase {
  const testUseCase = globalThis.__apiAuthTestUseCases?.findManyWithPerson

  if (testUseCase) {
    return testUseCase as FindManyWithPersonUseCase
  }

  const userRepository = new UserRepository()
  const findManyWithPersonUseCase = new FindManyWithPersonUseCase(
    userRepository,
  )

  return findManyWithPersonUseCase
}
