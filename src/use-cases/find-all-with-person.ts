import { IPerson, PersonRole } from '@/entities/models/person.interface'
import { IUser } from '@/entities/models/user.interface'
import { IUserRepository } from '@/repositories/user.repository.interface'

export class FindAllWithPersonUseCase {
  constructor(private userRepository: IUserRepository) {}

  async handler(role?: PersonRole): Promise<Array<IUser & Partial<IPerson>>> {
    return this.userRepository.findAllWithPerson(role)
  }
}
