import { IUser } from '@/entities/models/user.interface'
import { IUserRepository } from '@/repositories/user.repository.interface'
import { InvalidCredentialsError } from '@/use-cases/errors/invalid-credentials-error'

export class SignInUseCase {
  constructor(private userRepository: IUserRepository) {}

  async handler(username: string): Promise<IUser> {
    const user = await this.userRepository.findByUserName(username)

    if (!user) {
      throw new InvalidCredentialsError()
    }

    return user
  }
}
