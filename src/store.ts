import {
  createStore,
  useCreateStoreContext,
  type Store,
} from './_utils/create-store'
import type { ComposerRootProps, KonpoComposedBody } from './types'
import {
  blurComposerEditor,
  clearComposerEditor,
  createComposerEditor,
  focusKonpoEditor,
  isComposerEditorEmpty,
  selectComposerEditor,
  toKonpoComposedBody,
  toComposerEditorDescendants,
  type ComposerEditor,
  type ComposerEditorDescendant,
} from './composer-editor'
import { isPromise } from './_utils/promise'

export type KonpoStore = {
  editor: ComposerEditor
  disabled: boolean
  focused: boolean
  canSubmit: boolean
  initialValue: ComposerEditorDescendant[]
  focus: (resetSelection?: boolean) => void
  select: () => void
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
    editor: createComposerEditor(),
    disabled,
    focused: false,
    canSubmit: false,
    initialValue: initialValue
      ? toComposerEditorDescendants(initialValue)
      : [{ type: 'paragraph', children: [{ text: '' }] }],
    select: (): void => {
      const editor = get().editor
      selectComposerEditor(editor)
    },
    focus: (resetSelection?: boolean): void => {
      const editor = get().editor
      focusKonpoEditor(editor, resetSelection)
    },
    assert: (): void => {
      const editor = get().editor
      const disabled = get().disabled

      const isEmpty = isComposerEditorEmpty(editor, editor.children)

      set({ canSubmit: !isEmpty && !disabled })
    },
    clear: (): void => {
      const editor = get().editor
      clearComposerEditor(editor)

      set({ canSubmit: false })
    },
    blur: (): void => {
      const editor = get().editor
      blurComposerEditor(editor)
    },
    onSubmit: (): void => {
      const editor = get().editor

      // Extra check to avoid submitting an empty body
      if (isComposerEditorEmpty(editor, editor.children)) {
        return
      }

      const after = (): void => {
        get().clear()
        get().blur()
      }

      const body = toKonpoComposedBody(editor.children)
      const maybePromise = onSubmit(body)
      if (isPromise(maybePromise)) {
        maybePromise.then(after)
      }

      after()
    },
  }))
}

export const { useStore: useKonpoStore, Provider: KonpoStoreProvider } =
  useCreateStoreContext<KonpoStore>(
    '<Composer.Root /> is missing. Did you forget to wrap your component with <Composer.Root />?'
  )
