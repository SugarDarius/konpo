import { warn } from './console'

export function createDevelopmentWarning(
  message: string,
  ...args: Parameters<typeof console.warn>
): () => void {
  if (process.env.NODE_ENV !== 'production') {
    return (): void => {
      warn(message, ...args)
    }
  }

  return (): void => {}
}
