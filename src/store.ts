import {
  createStore,
  useCreateStoreContext,
  type Store,
} from './_utils/create-store'
import type { ComposerRootProps } from './types'

export type KonpoStore = {
  disabled: boolean
  onSubmit: () => void
}

export function createKonpoStore({
  disabled,
  onSubmit,
}: {
  disabled: boolean
  onSubmit: NonNullable<ComposerRootProps['onSubmit']>
}): Store<KonpoStore> {
  return createStore<KonpoStore>(() => ({
    disabled,
    onSubmit: (): void => {
      // TODO: add some works
      onSubmit()
    },
  }))
}

export const { useStore: useKonpoStore, Provider: KonpoStoreProvider } =
  useCreateStoreContext<KonpoStore>(
    '<Composer.Root /> is missing. Did you forget to wrap your component with <Composer.Root>?'
  )
