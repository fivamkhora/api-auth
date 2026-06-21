import { PersonRole } from '@/entities/models/person.interface'

export interface IUser {
  id?: number
  username: string
  password: string
  role: PersonRole
}
