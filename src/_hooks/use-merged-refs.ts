import { useStableCallback } from './use-stable-callback'

type ReactRef<T> = React.RefCallback<T> | React.RefObject<T>

const assignRef = <T>(ref: ReactRef<T>, value: T): void => {
  if (typeof ref === 'function') {
    ref(value)
  } else if (ref) {
    ref.current = value
  }
}

const mergeRefs = <T>(...refs: ReactRef<T>[]) => {
  return (node: T | null) => {
    refs.forEach((ref) => {
      assignRef(ref, node)
    })
  }
}

export function useMergedRefs<T>(...refs: ReactRef<T>[]) {
  return useStableCallback(() => mergeRefs(...refs))
}
