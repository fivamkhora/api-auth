import { In, Repository } from 'typeorm'

import { IPerson, PersonRole } from '@/entities/models/person.interface'
import { IUser } from '@/entities/models/user.interface'
import { Person } from '@/entities/person.entity'
import { User } from '@/entities/user.entity'
import { appDataSource } from '@/lib/typeorm/typeorm'
import { IUserRepository } from '@/repositories/user.repository.interface'

export class UserRepository implements IUserRepository {
  private userRepository: Repository<User>
  private personRepository: Repository<Person>

  constructor() {
    this.userRepository = appDataSource.getRepository(User)
    this.personRepository = appDataSource.getRepository(Person)
  }

  async findAllWithPerson(
    role?: PersonRole,
  ): Promise<Array<IUser & Partial<IPerson>>> {
    const query = this.userRepository
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

    if (role) {
      query.where('COALESCE(person.role, user.role) = :role', { role })
    }

    const users = await query
      .orderBy('user.id', 'ASC')
      .getRawMany<IUser & Partial<IPerson>>()

    return users
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

  async findManyWithPerson(
    ids: number[],
  ): Promise<Array<IUser & Partial<IPerson>>> {
    if (ids.length === 0) {
      return []
    }

    const users = await this.userRepository.find({
      where: {
        id: In(ids),
      },
    })
    const persons = await this.personRepository.find({
      where: {
        user_id: In(ids),
      },
    })
    const usersById = new Map(users.map((user) => [user.id, user]))
    const personsByUserId = new Map(
      persons
        .filter((person) => person.user_id !== undefined)
        .map((person) => [person.user_id, person]),
    )

    return ids.flatMap((id) => {
      const user = usersById.get(id)

      if (!user) {
        return []
      }

      const person = personsByUserId.get(id)

      return [
        {
          ...user,
          cpf: person?.cpf,
          name: person?.name,
          birth: person?.birth,
          email: person?.email,
          role: person?.role ?? user.role,
          user_id: person?.user_id,
        },
      ]
    })
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
