import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

import { IPerson, PersonRole } from '@/entities/models/person.interface'

@Entity({ name: 'person' })
export class Person implements IPerson {
  @PrimaryGeneratedColumn()
  id?: number

  @Column({ type: 'varchar', nullable: true })
  cpf?: string | null

  @Column({ type: 'varchar' })
  name!: string

  @Column({ type: 'date', nullable: true })
  birth?: Date | null

  @Column({ type: 'varchar' })
  email!: string

  @Column({ type: 'varchar' })
  role!: PersonRole

  @Column({ type: 'integer', nullable: true })
  user_id?: number

  constructor(
    cpf?: string,
    name?: string,
    birth?: Date,
    email?: string,
    role?: PersonRole,
  ) {
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

    if (role) {
      this.role = role
    }
  }
}
