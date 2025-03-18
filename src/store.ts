import {
  createStore,
  useCreateStoreContext,
  type Store,
} from './_utils/create-store'
import type {
  ComposerShortcuts,
  ComposerRootProps,
  KonpoComposedBody,
} from './types'
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
  clearComposerEditorMarks,
  insertComposerEditorHardBreak,
  insertComposerEditorSoftBreak,
} from './composer-editor'
import { isPromise } from './_utils/promise'
import { isHotKeys } from './_utils/keyboard'

export type KonpoStore = {
  editor: ComposerEditor
  disabled: boolean
  focused: boolean
  canSubmit: boolean
  initialValue: ComposerEditorDescendant[]
  selectedMarks: ComposerMarks
  isSelectionRangeActive: boolean
  activeSelectionRange: Range | null
  shortcuts: Required<ComposerShortcuts>
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
  initialDisabled,
  initialValue,
  initialShortcuts,
  handleSubmit,
}: {
  initialDisabled: boolean
  initialValue?: KonpoComposedBody
  initialShortcuts?: ComposerShortcuts
  handleSubmit: NonNullable<ComposerRootProps['onSubmit']>
}): Store<KonpoStore> {
  return createStore<KonpoStore>((set, get) => ({
    editor: createComposerEditor(),
    disabled: initialDisabled,
    focused: false,
    canSubmit: false,
    initialValue: initialValue
      ? toComposerEditorDescendants(initialValue)
      : [{ type: 'paragraph', children: [{ text: '' }] }],
    selectedMarks: baseComposerMarks,
    isSelectionRangeActive: false,
    activeSelectionRange: null,
    shortcuts: {
      submit: initialShortcuts?.submit ?? 'mod+Enter',
      hardBreak: initialShortcuts?.hardBreak ?? 'Enter',
      softBreak: initialShortcuts?.softBreak ?? 'shift+Enter',
      boldMark: initialShortcuts?.boldMark ?? 'mod+b',
      italicMark: initialShortcuts?.italicMark ?? 'mod+i',
      strikethroughMark: initialShortcuts?.strikethroughMark ?? 'mod+shift+s',
      codeMark: initialShortcuts?.codeMark ?? 'mod+e',
    },
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
      const state = get()

      requestAnimationFrame(() => {
        const isEmpty = isComposerEditorEmpty(
          state.editor,
          state.editor.children
        )
        if (isEmpty) {
          clearComposerEditorMarks(state.editor)
        }
        const selectedMarks = getSelectedComposerEditorMarks(state.editor)
        const activeSelectionRange = getComposerEditorActiveSelectionRange(
          state.editor,
          window.getSelection()
        )

        set({
          canSubmit: !isEmpty && !state.disabled,
          selectedMarks,
          isSelectionRangeActive: activeSelectionRange !== null,
          activeSelectionRange,
        })
      })
    },
    clear: (): void => {
      const editor = get().editor
      clearComposerEditor(editor)
      clearComposerEditorMarks(editor)

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
      const state = get()
      if (e.isDefaultPrevented()) {
        return
      }

      if (isHotKeys('Escape', e)) {
        if (state.isSelectionRangeActive) {
          e.preventDefault()

          state.discardActiveSelectionRange()
          discardComposerEditorActiveSelectionRange(state.editor)
        } else {
          state.blur()
        }

        return
      }

      if (isHotKeys(state.shortcuts.submit, e)) {
        e.preventDefault()
        state.onSubmit()

        return
      }

      if (isHotKeys(state.shortcuts.hardBreak, e)) {
        e.preventDefault()
        insertComposerEditorHardBreak(state.editor)

        return
      }

      if (isHotKeys(state.shortcuts.softBreak, e)) {
        e.preventDefault()
        insertComposerEditorSoftBreak(state.editor)

        return
      }

      if (isHotKeys(state.shortcuts.boldMark, e)) {
        e.preventDefault()
        state.toggleMark('bold')

        return
      }

      if (isHotKeys(state.shortcuts.italicMark, e)) {
        e.preventDefault()
        state.toggleMark('italic')

        return
      }

      if (isHotKeys(state.shortcuts.strikethroughMark, e)) {
        e.preventDefault()
        state.toggleMark('strikethrough')

        return
      }

      if (isHotKeys(state.shortcuts.codeMark, e)) {
        e.preventDefault()
        state.toggleMark('code')
      }
    },
    onSubmit: (): void => {
      const state = get()

      // Extra check to avoid submitting an empty body
      if (isComposerEditorEmpty(state.editor, state.editor.children)) {
        return
      }

      const after = (): void => {
        state.clear()
        state.blur()
      }

      const body = toKonpoComposedBody(state.editor.children)
      const maybePromise = handleSubmit(body)
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
