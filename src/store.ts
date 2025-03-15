import { createStore, useCreateStoreContext } from './_utils/create-store'

export type KonpoStore = {
  // TODO: update
  onSubmit: () => void
}

export function createKonpoStore() {
  return createStore<KonpoStore>(() => ({
    onSubmit: (): void => {
      console.log('submit')
    },
  }))
}

export const { useStore: useKonpoStore, Provider: KonpoStoreProvider } =
  useCreateStoreContext<KonpoStore>(
    'Composer.Root is missing. Did you forget to wrap your component with <Composer.Root>?'
  )
