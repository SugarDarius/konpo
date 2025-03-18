export type Hotkeys = string | string[]

type Modifier = 'alt' | 'ctrl' | 'meta' | 'shift' | 'mod'
type ParsedHotkeys = Record<Modifier, boolean> & { key: string }

const isApple = () =>
  typeof window !== 'undefined' &&
  /Mac|iPod|iPhone|iPad/.test(window.navigator.platform)

const parseHotkeys = (hotkeys: string): ParsedHotkeys => {
  const keys = hotkeys.split('+')
  const result = {
    alt: false,
    ctrl: false,
    meta: false,
    shift: false,
    mod: false,
    key: '',
  }

  result.key = keys.pop() || ''

  for (const modifier of keys) {
    switch (modifier.toLowerCase()) {
      case 'alt':
        result.alt = true
        break
      case 'ctrl':
        result.ctrl = true
        break
      case 'meta':
        result.meta = true
        break
      case 'shift':
        result.shift = true
        break
      case 'mod':
        // 'mod' is Command on Mac and Control on Windows/Linux
        result.mod = true
        if (isApple()) {
          result.meta = true
        } else {
          result.ctrl = true
        }
        break
    }
  }

  return result
}

export function isHotKeys(
  hotkeys: Hotkeys,
  event: KeyboardEvent | React.KeyboardEvent
): boolean {
  if (Array.isArray(hotkeys)) {
    return hotkeys.some((k) => isHotKeys(k, event))
  }
  const parsed = parseHotkeys(hotkeys)

  if (parsed.alt !== event.altKey) {
    return false
  }
  if (parsed.ctrl !== event.ctrlKey) {
    return false
  }
  if (parsed.meta !== event.metaKey) {
    return false
  }
  if (parsed.shift !== event.shiftKey) {
    return false
  }

  const eventKey = event.key.toLowerCase()
  const parsedKey = parsed.key.toLowerCase()

  return eventKey === parsedKey
}
