import { IPerson } from '@/entities/models/person.interface'
import { IUser } from '@/entities/models/user.interface'
import { IUserRepository } from '@/repositories/user.repository.interface'

export class FindManyWithPersonUseCase {
  constructor(private userRepository: IUserRepository) {}

  async handler(ids: number[]): Promise<Array<IUser & Partial<IPerson>>> {
    return this.userRepository.findManyWithPerson(ids)
  }
}
