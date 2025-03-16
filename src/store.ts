import {
  createStore,
  useCreateStoreContext,
  type Store,
} from './_utils/create-store'
import type { ComposerRootProps, KonpoComposedBody } from './types'
import {
  createKonpoEditor,
  isKonpoEditorEmpty,
  toKonpoComposedBody,
  toKonpoEditorDescendants,
  type KonpoEditor,
  type KonpoEditorDescendant,
} from './editor'

export type KonpoStore = {
  editor: KonpoEditor
  disabled: boolean
  initialValue: KonpoEditorDescendant[]
  clear: () => void
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
  return createStore<KonpoStore>((_set, get) => ({
    editor: createKonpoEditor(),
    disabled,
    initialValue: initialValue ? toKonpoEditorDescendants(initialValue) : [],
    clear: (): void => {},
    onSubmit: (): void => {
      const editor = get().editor

      if (isKonpoEditorEmpty(editor, editor.children)) {
        // No need to submit an empty body
        return
      }

      const body = toKonpoComposedBody(editor.children)
      onSubmit(body)

      get().clear()
    },
  }))
}

export const { useStore: useKonpoStore, Provider: KonpoStoreProvider } =
  useCreateStoreContext<KonpoStore>(
    '<Composer.Root /> is missing. Did you forget to wrap your component with <Composer.Root />?'
  )
