import { Repository } from 'typeorm'

import { IPerson } from '@/entities/models/person.interface'
import { IUser } from '@/entities/models/user.interface'
import { Person } from '@/entities/person.entity'
import { User } from '@/entities/user.entity'
import { appDataSource } from '@/lib/typeorm/typeorm'
import { IUserRepository } from '@/repositories/user.repository.interface'

export class UserRepository implements IUserRepository {
  private userRepository: Repository<User>

  constructor() {
    this.userRepository = appDataSource.getRepository(User)
  }

  async findWithPerson(user_id: number): Promise<(IUser & IPerson) | undefined> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('person', 'person', 'person.user_id = user.id')
      .select([
        'user.id AS id',
        'user.username AS username',
        'user.password AS password',
        'COALESCE(person.role, user.role) AS role',
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

  async findWithPersonByName(name: string): Promise<Array<IUser & IPerson>> {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('person', 'person', 'person.user_id = user.id')
      .select([
        'user.id AS id',
        'user.username AS username',
        'user.password AS password',
        'COALESCE(person.role, user.role) AS role',
        'person.cpf AS cpf',
        'person.name AS name',
        'person.birth AS birth',
        'person.email AS email',
        'person.user_id AS user_id',
      ])
      .where('LOWER(person.name) LIKE LOWER(:name)', { name: `%${name}%` })
      .getRawMany<IUser & IPerson>()

    return users
  }

  async findByUserName(
    username: string,
  ): Promise<(IUser & Partial<IPerson>) | undefined> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('person', 'person', 'person.user_id = user.id')
      .select([
        'user.id AS id',
        'user.username AS username',
        'user.password AS password',
        'COALESCE(person.role, user.role) AS role',
        'person.cpf AS cpf',
        'person.name AS name',
        'person.birth AS birth',
        'person.email AS email',
        'person.user_id AS user_id',
      ])
      .where('user.username = :username', { username })
      .getRawOne<IUser & Partial<IPerson>>()

    return user ?? undefined
  }

  async create(
    user: IUser,
    person?: Omit<IPerson, 'id' | 'user_id'>,
  ): Promise<(IUser & Partial<IPerson>) | undefined> {
    return appDataSource.transaction(async (manager) => {
      const createdUser = await manager.save(User, user)

      if (!person) {
        return createdUser
      }

      const createdPerson = await manager.save(Person, {
        ...person,
        user_id: createdUser.id,
      })

      return {
        ...createdUser,
        cpf: createdPerson.cpf,
        name: createdPerson.name,
        birth: createdPerson.birth,
        email: createdPerson.email,
        role: createdPerson.role,
        user_id: createdPerson.user_id,
      }
    })
  }
}
