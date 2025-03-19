import * as React from 'react'

type PossibleRef<T> = React.Ref<T> | undefined

/**
 * Set a given ref to a given value
 * This utility takes care of different types of refs: callback refs and RefObject(s)
 */
const setRef = <T>(ref: PossibleRef<T>, value: T | null) => {
  if (typeof ref === 'function') {
    return ref(value)
  } else if (ref !== null && ref !== undefined) {
    ref.current = value
  }
}

/**
 * A utility to compose multiple refs together
 * Accepts callback refs and RefObject(s)
 */
const composeRefs = <T>(...refs: PossibleRef<T>[]): React.RefCallback<T> => {
  return (node: T | null) => {
    const cleanups: ((() => void) | undefined)[] = []

    // Apply all refs and collect potential cleanup functions
    refs.forEach((ref) => {
      const cleanup = setRef(ref, node)
      if (typeof cleanup === 'function') {
        cleanups.push(cleanup)
      }
    })

    // Return a cleanup function that calls all collected cleanup functions
    return cleanups.length > 0
      ? () => cleanups.forEach((cleanup) => cleanup?.())
      : undefined
  }
}

/**
 * A custom hook that composes multiple refs
 * Accepts callback refs and RefObject(s)
 */
export function useComposedRefs<T>(
  ...refs: PossibleRef<T>[]
): React.RefCallback<T> {
  return React.useCallback(composeRefs(...refs), refs)
}
