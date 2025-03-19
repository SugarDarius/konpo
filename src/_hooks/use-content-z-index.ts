import { useCallback, useState } from 'react'

// import { useStableCallback } from './use-stable-callback'
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect'

export function useContentZIndex() {
  const [content, setContent] = useState<HTMLDivElement | null>(null)
  const [zIndex, setZIndex] = useState<string>()

  const contentRef = useCallback(setContent, [setContent])

  useIsomorphicLayoutEffect(() => {
    if (content) {
      const zIndex = window.getComputedStyle(content).zIndex
      setZIndex(zIndex)
    }
  }, [content])

  return [contentRef, zIndex] as const
}
