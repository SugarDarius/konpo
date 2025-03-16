const badge =
  'background:#BE53EB;border-radius:9999px;color:#fff;padding:3px 7px;font-family:sans-serif;font-weight:600;'

function wrap(
  method: 'log' | 'warn' | 'error'
): (message: string, ...args: readonly unknown[]) => void {
  return (message, ...args) =>
    console[method]('%Konpo%c', badge, message, ...args)
}

export const warn = wrap('warn')
export const error = wrap('error')
