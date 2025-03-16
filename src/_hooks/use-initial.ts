import { useReducer } from 'react'

export function useInitial<T>(value: T): T {
  return useReducer((s) => s, value)[0]
}
