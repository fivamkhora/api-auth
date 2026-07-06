export {}

declare global {
  var __apiAuthTestUseCases:
    | {
        createUser?: { handler: (...args: unknown[]) => unknown }
        signIn?: { handler: (...args: unknown[]) => unknown }
        findAllWithPerson?: { handler: (...args: unknown[]) => unknown }
        findWithPerson?: { handler: (...args: unknown[]) => unknown }
        findManyWithPerson?: { handler: (...args: unknown[]) => unknown }
      }
    | undefined
}
