export enum PersonRole {
  PROFESSOR = 'Professor',
  ALUNO = 'Aluno',
}

export interface IPerson {
  id?: number
  cpf?: string | null
  name: string
  birth?: Date | null
  email: string
  role: PersonRole
  user_id?: number
}
