export {}

declare global {
  var __apiAuthTestUseCases:
    | {
        createUser?: { handler: (...args: unknown[]) => unknown }
        signIn?: { handler: (...args: unknown[]) => unknown }
        findWithPerson?: { handler: (...args: unknown[]) => unknown }
      }
    | undefined
}
