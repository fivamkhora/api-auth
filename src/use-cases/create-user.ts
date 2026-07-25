import { IPerson } from '@/entities/models/person.interface'
import { IUserWithPerson } from '@/entities/models/user-with-person.interface'
import { User } from '@/entities/user.entity'
import { IUserRepository } from '@/repositories/user.repository.interface'

export class CreateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async handler(
    user: User,
    person?: Omit<IPerson, 'id' | 'user_id'>,
  ): Promise<IUserWithPerson | undefined> {
    return this.userRepository.create(user, person)
  }
}
