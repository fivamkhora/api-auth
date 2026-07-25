import { IUserWithPerson } from '@/entities/models/user-with-person.interface'
import { IUserRepository } from '@/repositories/user.repository.interface'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'

export class FindWithPersonUseCase {
  constructor(private userRepository: IUserRepository) {}

  async handler(userId: number): Promise<IUserWithPerson>
  async handler(name: string): Promise<IUserWithPerson[]>
  async handler(
    identifier: number | string,
  ): Promise<IUserWithPerson | IUserWithPerson[]> {
    if (typeof identifier === 'number') {
      const user = await this.userRepository.findWithPerson(identifier)

      if (!user) {
        throw new ResourceNotFoundError()
      }

      return user
    }

    const users = await this.userRepository.findWithPersonByName(identifier)

    if (users.length === 0) {
      throw new ResourceNotFoundError()
    }

    return users
  }
}
