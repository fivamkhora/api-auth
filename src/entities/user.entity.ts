import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

import { IUser } from '@/entities/models/user.interface'

@Entity({ name: 'user' })
export class User implements IUser {
  @PrimaryGeneratedColumn()
  id?: number

  @Column({ type: 'varchar', unique: true })
  username!: string

  @Column({ type: 'varchar' })
  password!: string

  constructor(username?: string, password?: string) {
    if (username) {
      this.username = username
    }

    if (password) {
      this.password = password
    }
  }
}
