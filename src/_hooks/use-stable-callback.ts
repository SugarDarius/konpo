import { useCallback, useRef } from 'react'
import { useLayoutEffect } from './use-layout-effect'

export function useStableCallback<A extends unknown[], R>(
  callback: (...args: A) => R
): (...args: A) => R {
  const callbackRef = useRef(callback)

  useLayoutEffect(() => {
    callbackRef.current = callback
  })

  return useCallback((...args: A): R => {
    return callbackRef.current(...args)
  }, [])
}
