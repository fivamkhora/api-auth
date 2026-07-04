import { IPerson } from '@/entities/models/person.interface'
import { IUser } from '@/entities/models/user.interface'
import { IUserRepository } from '@/repositories/user.repository.interface'
import { ResourceNotFoundError } from '@/use-cases/errors/resource-not-found-error'

export class FindWithPersonUseCase {
  constructor(private userRepository: IUserRepository) {}

  async handler(userId: number): Promise<IUser & IPerson>
  async handler(name: string): Promise<Array<IUser & IPerson>>
  async handler(
    identifier: number | string,
  ): Promise<(IUser & IPerson) | Array<IUser & IPerson>> {
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
