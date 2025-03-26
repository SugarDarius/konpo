import { ignoreOnThrow } from '../_utils/error'
import { isEmptyString } from '../_utils/string'

import type {
  ComposerEditor,
  ComposerEditorDescendant,
  ComposerEditorLocation,
} from './composer'
import {
  SlateEditor,
  SlateTransforms,
  SlateReactEditor,
  SlateRange,
} from './composer'

import {
  isComposerBulletList,
  isComposerListItem,
  isComposerParagraph,
  isComposerText,
} from './guards'

// NOTE: This function is used to check if the editor is empty.
// It may be useful to rethink this algorithm to make it more efficient.
export function isComposerEditorEmpty(
  editor: ComposerEditor,
  descendants: ComposerEditorDescendant[]
): boolean {
  if (descendants.length <= 0) {
    return true
  }

  for (const descendant of descendants) {
    if (isComposerText(descendant)) {
      if (!isEmptyString(descendant.text)) {
        return false
      }
    } else if (isComposerParagraph(descendant)) {
      if (!isComposerEditorEmpty(editor, descendant.children)) {
        return false
      }
    } else if (isComposerBulletList(descendant)) {
      if (!isComposerEditorEmpty(editor, descendant.children)) {
        return false
      }
    } else if (isComposerListItem(descendant)) {
      if (!isComposerEditorEmpty(editor, descendant.children)) {
        return false
      }
    } else {
      if (!SlateEditor.isEmpty(editor, descendant)) {
        return false
      }
    }
  }

  return true
}

export function clearComposerEditor(editor: ComposerEditor): void {
  ignoreOnThrow(
    "Failed to clear composer's editor, '<Composer.Root />' may be unmounted.",
    (): void => {
      SlateTransforms.delete(editor, {
        at: {
          anchor: SlateEditor.start(editor, []),
          focus: SlateEditor.end(editor, []),
        },
      })
    }
  )
}

export function blurComposerEditor(editor: ComposerEditor): void {
  ignoreOnThrow(
    "Failed to blur composer's editor, '<Composer.Root />' may be unmounted.",
    (): void => {
      SlateReactEditor.blur(editor)
    }
  )
}

export function focusComposerEditor(
  editor: ComposerEditor,
  resetSelection = true
): void {
  ignoreOnThrow(
    "Failed to focus composer's editor, '<Composer.Root />' may be unmounted.",
    (): void => {
      if (!SlateReactEditor.isFocused(editor)) {
        SlateTransforms.select(
          editor,
          resetSelection || !editor.selection
            ? SlateEditor.end(editor, [])
            : editor.selection
        )
        SlateReactEditor.focus(editor)
      }
    }
  )
}

export function selectComposerEditor(editor: ComposerEditor): void {
  ignoreOnThrow(
    "Failed to select composer's editor, '<Composer.Root />' may be unmounted.",
    (): void => {
      SlateTransforms.select(editor, SlateEditor.end(editor, []))
    }
  )
}

export function getComposerEditorActiveSelectionRange(
  editor: ComposerEditor,
  domSelection: Selection | null
): Range | null {
  const selection = editor.selection
  if (
    !selection ||
    SlateRange.isCollapsed(selection) ||
    !domSelection ||
    !domSelection.rangeCount
  ) {
    return null
  }

  return domSelection.getRangeAt(0)
}

export function discardComposerEditorActiveSelectionRange(
  editor: ComposerEditor
): void {
  ignoreOnThrow(
    "Failed to discard active selection range, '<Composer.Root />' may be unmounted.",
    (): void => {
      SlateTransforms.deselect(editor)
      selectComposerEditor(editor)
    }
  )
}

export function insertComposerEditorHardBreak(editor: ComposerEditor): void {
  editor.insertBreak()
}
export function insertComposerEditorSoftBreak(editor: ComposerEditor): void {
  editor.insertSoftBreak()
}

export function getCharacterBefore(
  editor: ComposerEditor,
  at: ComposerEditorLocation
): { range: SlateRange; text: string } | undefined {
  const before = SlateEditor.before(editor, at, { unit: 'character' })
  if (!before) {
    return
  }

  const to = SlateRange.isRange(at) ? SlateRange.start(at) : at
  const range = SlateEditor.range(editor, before, to)
  const text = SlateEditor.string(editor, range)

  return { range, text }
}

export function getCharacterAfter(
  editor: ComposerEditor,
  at: ComposerEditorLocation
): { range: SlateRange; text: string } | undefined {
  const after = SlateEditor.after(editor, at, { unit: 'character' })
  if (!after) {
    return
  }

  const to = SlateRange.isRange(at) ? SlateRange.end(at) : at
  const range = SlateEditor.range(editor, to, after)
  const text = SlateEditor.string(editor, range)

  return { range, text }
}
