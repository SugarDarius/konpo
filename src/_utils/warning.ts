const badge =
  'background:#BE53EB;border-radius:9999px;color:#fff;padding:3px 7px;font-family:sans-serif;font-weight:600;'

export function createDevelopmentWarning(
  message: string,
  ...args: Parameters<typeof console.warn>
): () => void {
  if (process.env.NODE_ENV !== 'production') {
    return (): void => {
      console.warn('%cKonpo%c', badge, message, ...args)
    }
  }

  return (): void => {}
}
