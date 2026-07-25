import { IUserWithPerson } from '@/entities/models/user-with-person.interface'
import { IUserRepository } from '@/repositories/user.repository.interface'

export class FindManyWithPersonUseCase {
  constructor(private userRepository: IUserRepository) {}

  async handler(ids: number[]): Promise<IUserWithPerson[]> {
    return this.userRepository.findManyWithPerson(ids)
  }
}
