import { IUser } from '@/entities/models/user.interface'

export interface IUserWithPerson extends IUser {
  cpf?: string | null
  name?: string | null
  birth?: Date | null
  email?: string | null
  user_id?: number | null
}
