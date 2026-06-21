export enum PersonRole {
  PROFESSOR = 'Professor',
  ALUNO = 'Aluno',
}

export interface IPerson {
  id?: number
  cpf: string
  name: string
  birth: Date
  email: string
  role: PersonRole
  user_id?: number
}
