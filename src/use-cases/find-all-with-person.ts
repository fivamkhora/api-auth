import { PersonRole } from '@/entities/models/person.interface'
import { IUserWithPerson } from '@/entities/models/user-with-person.interface'
import { IUserRepository } from '@/repositories/user.repository.interface'

export class FindAllWithPersonUseCase {
  constructor(private userRepository: IUserRepository) {}

  async handler(role?: PersonRole): Promise<IUserWithPerson[]> {
    return this.userRepository.findAllWithPerson(role)
  }
}
