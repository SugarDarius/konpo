import {
  createStore,
  useCreateStoreContext,
  type Store,
} from './_utils/create-store'
import type { ComposerRootProps, KonpoComposedBody } from './types'
import {
  createKonpoEditor,
  toKonpoEditorDescendants,
  type KonpoEditor,
  type KonpoEditorDescendant,
} from './editor'

export type KonpoStore = {
  editor: KonpoEditor
  disabled: boolean
  initialValue: KonpoEditorDescendant[]
  onSubmit: () => void
}

export function createKonpoStore({
  disabled,
  initialValue,
  onSubmit,
}: {
  disabled: boolean
  initialValue?: KonpoComposedBody
  onSubmit: NonNullable<ComposerRootProps['onSubmit']>
}): Store<KonpoStore> {
  return createStore<KonpoStore>(() => ({
    editor: createKonpoEditor(),
    disabled,
    initialValue: initialValue ? toKonpoEditorDescendants(initialValue) : [],
    onSubmit: (): void => {
      // TODO: add some transform operations here
      onSubmit({ content: [] })
    },
  }))
}

export const { useStore: useKonpoStore, Provider: KonpoStoreProvider } =
  useCreateStoreContext<KonpoStore>(
    '<Composer.Root /> is missing. Did you forget to wrap your component with <Composer.Root />?'
  )
