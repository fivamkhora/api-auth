import { UserRepository } from '@/repositories/typeorm/user.repository'
import { FindWithPersonUseCase } from '@/use-cases/find-with-person'

export function makeFindWithPersonUseCase() {
  const userRepository = new UserRepository()
  const findWithPersonUseCase = new FindWithPersonUseCase(userRepository)

  return findWithPersonUseCase
}
