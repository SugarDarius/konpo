export type Hotkey = string | string[]

type Modifier = 'alt' | 'ctrl' | 'meta' | 'shift' | 'mod'
type ParsedHotkey = Record<Modifier, boolean> & { key: string }

const isApple = () =>
  typeof window !== 'undefined' &&
  /Mac|iPod|iPhone|iPad/.test(window.navigator.platform)

const parseHotkey = (hotkey: string): ParsedHotkey => {
  const keys = hotkey.split('+')
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

export function isHotKey(
  hotkey: Hotkey,
  event: KeyboardEvent | React.KeyboardEvent
): boolean {
  if (Array.isArray(hotkey)) {
    return hotkey.some((k) => isHotKey(k, event))
  }
  const parsed = parseHotkey(hotkey)

  if (parsed.alt !== event.altKey) return false
  if (parsed.ctrl !== event.ctrlKey) return false
  if (parsed.meta !== event.metaKey) return false
  if (parsed.shift !== event.shiftKey) return false

  const eventKey = event.key.toLowerCase()
  const parsedKey = parsed.key.toLowerCase()

  return eventKey === parsedKey
}
