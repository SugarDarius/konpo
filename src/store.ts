import {
  createStore,
  useCreateStoreContext,
  type Store,
} from './_utils/create-store'
import type { ComposerRootProps, KonpoComposedBody } from './types'
import {
  blurKonpoEditor,
  clearKonpoEditor,
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
  focused: boolean
  canSubmit: boolean
  initialValue: KonpoEditorDescendant[]
  assert: () => void
  clear: () => void
  blur: () => void
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
  return createStore<KonpoStore>((set, get) => ({
    editor: createKonpoEditor(),
    disabled,
    focused: false,
    canSubmit: false,
    initialValue: initialValue ? toKonpoEditorDescendants(initialValue) : [],
    assert: (): void => {
      const editor = get().editor
      const disabled = get().disabled

      const isEmpty = isKonpoEditorEmpty(editor, editor.children)

      set({ canSubmit: !isEmpty && !disabled })
    },
    clear: (): void => {
      const editor = get().editor
      clearKonpoEditor(editor)

      set({ canSubmit: false })
    },
    blur: (): void => {
      const editor = get().editor
      blurKonpoEditor(editor)
    },
    onSubmit: (): void => {
      const editor = get().editor

      if (isKonpoEditorEmpty(editor, editor.children)) {
        // No need to submit an empty body
        return
      }

      const body = toKonpoComposedBody(editor.children)
      onSubmit(body)

      get().clear()
      get().blur()
    },
  }))
}

export const { useStore: useKonpoStore, Provider: KonpoStoreProvider } =
  useCreateStoreContext<KonpoStore>(
    '<Composer.Root /> is missing. Did you forget to wrap your component with <Composer.Root />?'
  )
