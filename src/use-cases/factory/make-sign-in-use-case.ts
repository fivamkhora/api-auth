import { UserRepository } from '@/repositories/typeorm/user.repository'
import { SignInUseCase } from '@/use-cases/sign-in'

export function makeSignInUseCase(): SignInUseCase {
  const testUseCase = globalThis.__apiAuthTestUseCases?.signIn

  if (testUseCase) {
    return testUseCase as SignInUseCase
  }

  const userRepository = new UserRepository()
  const signInUseCase = new SignInUseCase(userRepository)

  return signInUseCase
}
