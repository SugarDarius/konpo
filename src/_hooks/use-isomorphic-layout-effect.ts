'use client'

import { useEffect, useLayoutEffect as useOriginalLayoutEffect } from 'react'

export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useOriginalLayoutEffect : useEffect
