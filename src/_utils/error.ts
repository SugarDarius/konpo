import { error } from './console'

export function ignoreOnThrow<T>(message: string, fn: () => T): T | undefined {
  try {
    return fn()
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      error(message, err)
    }
    return undefined
  }
}
