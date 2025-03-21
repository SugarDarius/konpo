import { ignoreOnThrow } from '../_utils/error'
import type { ComposerMarks, ComposerMark } from '../types'

import {
  getCharacterAfter,
  getCharacterBefore,
  isComposerEditorEmpty,
} from './common'

import type { ComposerEditor } from './composer'
import { SlateEditor, SlateRange } from './composer'

export const baseComposerMarks: ComposerMarks = {
  bold: false,
  italic: false,
  strikethrough: false,
  code: false,
}

export function getSelectedComposerEditorMarks(
  editor: ComposerEditor
): ComposerMarks {
  const marks = SlateEditor.marks(editor)
  return { ...baseComposerMarks, ...marks }
}

export function isComposerMarkActive(
  editor: ComposerEditor,
  mark: ComposerMark
): boolean {
  const marks = getSelectedComposerEditorMarks(editor)
  const isActive = marks[mark]

  return isActive
}

export function toggleComposerEditorMark(
  editor: ComposerEditor,
  mark: ComposerMark
): void {
  const isMarkActive = isComposerMarkActive(editor, mark)

  if (isComposerEditorEmpty(editor, editor.children)) {
    editor.pendingPrimeMarks = { [mark]: !isMarkActive }
    return
  }

  if (isMarkActive) {
    SlateEditor.removeMark(editor, mark)
  } else {
    SlateEditor.addMark(editor, mark, true)
  }
}

export function clearComposerEditorMarks(editor: ComposerEditor): void {
  ignoreOnThrow(
    "Failed to clear composer's editor marks, '<Composer.Root />' may be unmounted.",
    (): void => {
      const marks = SlateEditor.marks(editor)
      if (marks) {
        for (const mark in marks) {
          SlateEditor.removeMark(editor, mark)
        }
      }
    }
  )
}

export function leaveComposerEditorMarkFromEdgeCharacter(
  editor: ComposerEditor,
  edge: 'start' | 'end'
): void {
  const selection = editor.selection
  if (selection && SlateRange.isCollapsed(selection)) {
    const marks = Object.keys(SlateEditor.marks(editor) ?? {})
    if (marks.length > 0) {
      const character =
        edge === 'start'
          ? getCharacterBefore(editor, selection)
          : getCharacterAfter(editor, selection)

      if (!character) {
        clearComposerEditorMarks(editor)
      }
    }
  }
}

export const withPrimeMarks = (editor: ComposerEditor): ComposerEditor => {
  const { insertText: baseInsertText } = editor

  // Apply pending marks before inserting text
  // Mostly used to apply marks before inserting any text in the editor
  editor.insertText = (text) => {
    const pendingPrimeMarks = editor.pendingPrimeMarks ?? {}
    const hasPendingMarks = Object.keys(pendingPrimeMarks).length > 0

    if (hasPendingMarks) {
      for (const [mark, value] of Object.entries(pendingPrimeMarks)) {
        SlateEditor.addMark(editor, mark, value)
      }
    }

    baseInsertText(text)
    editor.pendingPrimeMarks = {}
  }

  return editor
}
