import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

import { IPerson } from '@/entities/models/person.interface'

@Entity({ name: 'person' })
export class Person implements IPerson {
  @PrimaryGeneratedColumn()
  id?: number

  @Column({ type: 'varchar' })
  cpf!: string

  @Column({ type: 'varchar' })
  name!: string

  @Column({ type: 'date' })
  birth!: Date

  @Column({ type: 'varchar' })
  email!: string

  @Column({ type: 'integer', nullable: true })
  user_id?: number

  constructor(cpf?: string, name?: string, birth?: Date, email?: string) {
    if (cpf) {
      this.cpf = cpf
    }

    if (name) {
      this.name = name
    }

    if (birth) {
      this.birth = birth
    }

    if (email) {
      this.email = email
    }
  }
}
