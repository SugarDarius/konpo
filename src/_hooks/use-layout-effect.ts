'use client'

import { useEffect, useLayoutEffect as useOriginalLayoutEffect } from 'react'

export const useLayoutEffect =
  typeof window !== 'undefined' ? useOriginalLayoutEffect : useEffect
