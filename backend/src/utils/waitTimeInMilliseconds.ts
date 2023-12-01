export const waitTimeInMilliseconds = async (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))
