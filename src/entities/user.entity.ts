import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

import { PersonRole } from '@/entities/models/person.interface'
import { IUser } from '@/entities/models/user.interface'

@Entity({ name: 'user' })
export class User implements IUser {
  @PrimaryGeneratedColumn()
  id?: number

  @Column({ type: 'varchar', unique: true })
  username!: string

  @Column({ type: 'varchar' })
  password!: string

  @Column({ type: 'varchar' })
  role!: PersonRole

  constructor(username?: string, password?: string, role?: PersonRole) {
    if (username) {
      this.username = username
    }

    if (password) {
      this.password = password
    }

    if (role) {
      this.role = role
    }
  }
}
