import { IPerson } from '@/entities/models/person.interface'
import { User } from '@/entities/user.entity'
import { IUserRepository } from '@/repositories/user.repository.interface'

export class CreateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async handler(
    user: User,
    person?: Omit<IPerson, 'id' | 'user_id'>,
  ): Promise<(User & Partial<IPerson>) | undefined> {
    const createdUser = await this.userRepository.create(user, person)

    return createdUser as (User & Partial<IPerson>) | undefined
  }
}
