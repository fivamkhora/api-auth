import { IPerson, PersonRole } from '@/entities/models/person.interface'
import { IUser } from '@/entities/models/user.interface'
import { IUserWithPerson } from '@/entities/models/user-with-person.interface'

export interface IUserRepository {
  findAllWithPerson(role?: PersonRole): Promise<IUserWithPerson[]>
  findWithPerson(user_id: number): Promise<IUserWithPerson | undefined>
  findWithPersonByName(name: string): Promise<IUserWithPerson[]>
  findManyWithPerson(ids: number[]): Promise<IUserWithPerson[]>
  findByUserName(username: string): Promise<IUserWithPerson | undefined>
  create(
    user: IUser,
    person?: Omit<IPerson, 'id' | 'user_id'>,
  ): Promise<IUserWithPerson | undefined>
}
