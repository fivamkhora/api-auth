import { IPerson } from '@/entities/models/person.interface'
import { IUser } from '@/entities/models/user.interface'

export interface IUserRepository {
  findWithPerson(user_id: number): Promise<(IUser & IPerson) | undefined>
  findWithPersonByName(name: string): Promise<Array<IUser & IPerson>>
  findByUserName(username: string): Promise<(IUser & Partial<IPerson>) | undefined>
  create(
    user: IUser,
    person?: Omit<IPerson, 'id' | 'user_id'>,
  ): Promise<(IUser & Partial<IPerson>) | undefined>
}
