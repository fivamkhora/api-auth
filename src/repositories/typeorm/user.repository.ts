import { Repository } from 'typeorm'

import { IPerson } from '@/entities/models/person.interface'
import { IUser } from '@/entities/models/user.interface'
import { User } from '@/entities/user.entity'
import { appDataSource } from '@/lib/typeorm/typeorm'
import { IUserRepository } from '@/repositories/user.repository.interface'

export class UserRepository implements IUserRepository {
  private repository: Repository<User>

  constructor() {
    this.repository = appDataSource.getRepository(User)
  }

  async findWithPerson(user_id: number): Promise<(IUser & IPerson) | undefined> {
    const user = await this.repository
      .createQueryBuilder('user')
      .leftJoin('person', 'person', 'person.user_id = user.id')
      .select([
        'user.id AS id',
        'user.username AS username',
        'user.password AS password',
        'person.cpf AS cpf',
        'person.name AS name',
        'person.birth AS birth',
        'person.email AS email',
        'person.user_id AS user_id',
      ])
      .where('user.id = :user_id', { user_id })
      .getRawOne<IUser & IPerson>()

    return user ?? undefined
  }

  async findByUserName(username: string): Promise<IUser | undefined> {
    const user = await this.repository.findOne({ where: { username } })

    return user ?? undefined
  }

  async create(user: IUser): Promise<IUser | undefined> {
    return this.repository.save(user)
  }
}
