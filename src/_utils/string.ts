export function isEmptyString(input: string): boolean {
  return input.trim() === ''
}

const PROTOCOL_AND_DOMAIN_REGEX = /^(?:\w+:)?\/\/(\S+)$/
const LOCALHOST_DOMAIN_REGEX = /^localhost[:?\d]*(?:[^:?\d]\S*)?$/
const NON_LOCALHOST_DOMAIN_REGEX = /^[^\s.]+\.\S{2,}$/

export function isUrl(input: string): boolean {
  if (isEmptyString(input)) {
    return false
  }

  const match = input.match(PROTOCOL_AND_DOMAIN_REGEX)
  if (!match) {
    return false
  }

  const everythingAfterProtocol = match[1]
  if (!everythingAfterProtocol) {
    return false
  }

  if (
    LOCALHOST_DOMAIN_REGEX.test(everythingAfterProtocol) ||
    NON_LOCALHOST_DOMAIN_REGEX.test(everythingAfterProtocol)
  ) {
    return true
  }

  return false
}

export function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
