const isApple = () =>
  typeof window !== 'undefined' &&
  /Mac|iPod|iPhone|iPad/.test(window.navigator.platform)

type ModifierKey = 'alt' | 'ctrl' | 'meta' | 'mod' | 'shift'
type EventProperty = 'altKey' | 'ctrlKey' | 'metaKey' | 'shiftKey'

const MODIFIERS: Record<ModifierKey, () => EventProperty> = {
  alt: () => 'altKey',
  ctrl: () => 'ctrlKey',
  meta: () => 'metaKey',
  mod: () => (isApple() ? 'metaKey' : 'ctrlKey'),
  shift: () => 'shiftKey',
}

export function isKey(
  event: KeyboardEvent | React.KeyboardEvent,
  key: string,
  modifiers: Partial<Record<ModifierKey, boolean>> = {}
): boolean {
  if (event.key !== key) {
    return false
  }

  return Object.entries(modifiers).every(([modifier, expectedState]) => {
    // Skip undefined modifiers
    if (typeof expectedState !== 'boolean') {
      return true
    }

    const eventProperty = MODIFIERS[modifier as ModifierKey]()
    return event[eventProperty] === expectedState
  })
}
