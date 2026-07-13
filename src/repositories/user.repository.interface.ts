import { IPerson, PersonRole } from '@/entities/models/person.interface'
import { IUser } from '@/entities/models/user.interface'

export interface IUserRepository {
  findAllWithPerson(role?: PersonRole): Promise<Array<IUser & Partial<IPerson>>>
  findWithPerson(user_id: number): Promise<(IUser & IPerson) | undefined>
  findWithPersonByName(name: string): Promise<Array<IUser & IPerson>>
  findManyWithPerson(ids: number[]): Promise<Array<IUser & Partial<IPerson>>>
  findByUserName(username: string): Promise<(IUser & Partial<IPerson>) | undefined>
  create(
    user: IUser,
    person?: Omit<IPerson, 'id' | 'user_id'>,
  ): Promise<(IUser & Partial<IPerson>) | undefined>
}
