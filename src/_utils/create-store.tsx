'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type PropsWithChildren,
} from 'react'

export type Store<T extends object> = {
  get: () => T
  set: (partial: Partial<T> | ((state: T) => Partial<T>)) => void
  subscribe: (subscriber: (state: T) => void) => () => void
}

/** Create and returns getter, setter and subscriber */
export function createStore<T extends object>(
  createInitialState: (set: Store<T>['set'], get: Store<T>['get']) => T
): Store<T> {
  let state = {} as T
  let pending: T | null = null
  let frameId: number | null = null
  const subscribers = new Set<(store: T) => void>()

  const flush = () => {
    if (pending) {
      state = pending
      pending = null

      for (const subscriber of subscribers) {
        subscriber(state)
      }
    }

    frameId = null
  }

  const get = () => pending ?? state

  const set: Store<T>['set'] = (partial) => {
    pending ??= state
    Object.assign(
      pending as T,
      typeof partial === 'function'
        ? (partial as (state: T) => Partial<T>)(get())
        : partial
    )

    if (!frameId) {
      frameId = requestAnimationFrame(flush)
    }
  }

  const subscribe = (subscriber: (state: T) => void) => {
    subscribers.add(subscriber)

    return () => subscribers.delete(subscriber)
  }

  state = createInitialState(set, get)

  return { get, set, subscribe } as const
}

/** Create a store with a given initial state only once. */
export function useCreateStore<T extends object>(createStore: () => Store<T>) {
  return useMemo(() => createStore(), [])
}

/** Create a store context and provider. */
export function useCreateStoreContext<T extends object>(
  missingProviderError?: string
) {
  const Context = createContext<Store<T> | null>(null)

  const useStore = (): Store<T> => {
    const store = useContext(Context)

    if (!store) {
      throw new Error(missingProviderError)
    }

    return store
  }

  const Provider = ({
    store,
    children,
  }: PropsWithChildren<{ store: Store<T> }>) => {
    return <Context.Provider value={store}>{children}</Context.Provider>
  }

  return { useStore, Provider } as const
}

/** Run a selector against the store state. */
export function useSelector<T extends object, S>(
  store: Store<T>,
  selector: (state: T) => S
) {
  const cb = () => selector(store.get())
  return useSyncExternalStore(store.subscribe, cb, cb)
}

/** Get a property from the store based on a key */
export function useSelectorKey<T extends object, K extends keyof T>(
  store: Store<T>,
  key: K
) {
  const selector = useCallback((state: T) => state[key], [key])

  return useSelector(store, selector)
}
