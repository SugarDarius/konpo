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
  focusComposerEditor,
  isComposerEditorEmpty,
  selectComposerEditor,
  toKonpoComposedBody,
  toComposerEditorDescendants,
  baseComposerMarks,
  type ComposerEditor,
  type ComposerEditorDescendant,
  type ComposerMarks,
  getSelectedComposerEditorMarks,
  type ComposerMark,
  toggleComposerEditorMark,
  getComposerEditorActiveSelectionRange,
  discardComposerEditorActiveSelectionRange,
} from './composer-editor'
import { isPromise } from './_utils/promise'
import { isKey } from './_utils/keyboard'

export type KonpoStore = {
  editor: ComposerEditor
  disabled: boolean
  focused: boolean
  canSubmit: boolean
  initialValue: ComposerEditorDescendant[]
  selectedMarks: ComposerMarks
  isSelectionRangeActive: boolean
  activeSelectionRange: Range | null
  focus: (resetSelection?: boolean) => void
  select: () => void
  assert: () => void
  clear: () => void
  blur: () => void
  toggleMark: (mark: ComposerMark) => void
  discardActiveSelectionRange: () => void
  handleKeyboardKeys: (e: React.KeyboardEvent<HTMLDivElement>) => void
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
    selectedMarks: baseComposerMarks,
    isSelectionRangeActive: false,
    activeSelectionRange: null,
    select: (): void => {
      const editor = get().editor
      selectComposerEditor(editor)
    },
    focus: (resetSelection?: boolean): void => {
      const editor = get().editor
      focusComposerEditor(editor, resetSelection)

      set({ focused: true })
    },
    assert: (): void => {
      const editor = get().editor
      const disabled = get().disabled

      requestAnimationFrame(() => {
        const isEmpty = isComposerEditorEmpty(editor, editor.children)
        const selectedMarks = getSelectedComposerEditorMarks(editor)
        const activeSelectionRange = getComposerEditorActiveSelectionRange(
          editor,
          window.getSelection()
        )

        set({
          canSubmit: !isEmpty && !disabled,
          selectedMarks,
          isSelectionRangeActive: activeSelectionRange !== null,
          activeSelectionRange,
        })
      })
    },
    clear: (): void => {
      const editor = get().editor
      clearComposerEditor(editor)

      set({
        canSubmit: false,
        activeSelectionRange: null,
        isSelectionRangeActive: false,
      })
    },
    blur: (): void => {
      const editor = get().editor
      blurComposerEditor(editor)

      set({
        focused: false,
        activeSelectionRange: null,
        isSelectionRangeActive: false,
      })
    },
    toggleMark: (mark: ComposerMark): void => {
      const editor = get().editor

      toggleComposerEditorMark(editor, mark)
      const selectedMarks = getSelectedComposerEditorMarks(editor)

      set({ selectedMarks })
    },
    discardActiveSelectionRange: (): void => {
      set({
        activeSelectionRange: null,
        isSelectionRangeActive: false,
      })
    },
    handleKeyboardKeys: (e: React.KeyboardEvent<HTMLDivElement>): void => {
      const editor = get().editor
      const isSelectionRangeActive = get().isSelectionRangeActive
      const discardActiveSelectionRange = get().discardActiveSelectionRange

      const blur = get().blur
      if (e.isDefaultPrevented()) {
        return
      }

      if (isSelectionRangeActive) {
        if (isKey(e, 'Escape')) {
          e.preventDefault()
          discardActiveSelectionRange()
          discardComposerEditorActiveSelectionRange(editor)
        }
      } else {
        if (isKey(e, 'Escape')) {
          blur()
        }
      }
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
