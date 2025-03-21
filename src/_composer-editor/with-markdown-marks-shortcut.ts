import type { ComposerMark } from '../types'
import type { ComposerEditor } from './composer'
import {
  SlateEditor,
  SlateElement,
  SlateRange,
  SlateTransforms,
} from './composer'

const applyMarkdownFormatting = (
  editor: SlateEditor,
  match: RegExpMatchArray,
  format: ComposerMark
) => {
  const { selection } = editor
  if (!selection) return

  const [fullMatch, content] = match
  if (!content) {
    return
  }
  const { anchor } = selection

  // Calculate the positions
  const startOfMatch = anchor.offset - fullMatch.length
  const endOfMatch = anchor.offset

  // Delete the matched text (including markdown syntax)
  SlateTransforms.delete(editor, {
    at: {
      anchor: { ...anchor, offset: startOfMatch },
      focus: { ...anchor, offset: endOfMatch },
    },
  })

  // Insert the content without markdown syntax
  SlateTransforms.insertText(editor, content, {
    at: { ...anchor, offset: startOfMatch },
  })

  // Apply the mark to the inserted content
  SlateTransforms.select(editor, {
    anchor: { ...anchor, offset: startOfMatch },
    focus: { ...anchor, offset: startOfMatch + content.length },
  })

  // Apply the mark
  SlateEditor.addMark(editor, format, true)

  // Move cursor to the end of the formatted text
  SlateTransforms.collapse(editor, { edge: 'end' })

  // Remove the mark after applying it.
  SlateEditor.removeMark(editor, format)
}

export const withMarkdownMarksShortcuts = (
  editor: ComposerEditor
): ComposerEditor => {
  const { insertText: baseInsertText } = editor

  editor.insertText = (text) => {
    baseInsertText(text)

    // Only process if we're inserting a character that could complete a markdown pattern
    if (['*', '_', '~', '`'].includes(text)) {
      const { selection } = editor

      // Only process if we have a valid cursor position
      if (selection && SlateRange.isCollapsed(selection)) {
        const { anchor } = selection
        const block = SlateEditor.above(editor, {
          match: (n) =>
            SlateElement.isElement(n) && SlateEditor.isBlock(editor, n),
        })

        if (block) {
          const [, blockPath] = block
          const start = SlateEditor.start(editor, blockPath)
          const range = { anchor, focus: start }
          const beforeText = SlateEditor.string(editor, range)

          // Check for bold: *text*
          const boldMatch = beforeText.match(/\*([^\s].*?[^\s])\*$/)
          if (boldMatch && boldMatch[1] && boldMatch[1].length > 0) {
            applyMarkdownFormatting(editor, boldMatch, 'bold')
            return
          }

          // Check for italic: _text_
          const italicMatch = beforeText.match(/_([^\s].*?[^\s])_$/)
          if (italicMatch && italicMatch[1] && italicMatch[1].length > 0) {
            applyMarkdownFormatting(editor, italicMatch, 'italic')
            return
          }

          // Check for strikethrough: ~text~
          const strikeMatch = beforeText.match(/~([^\s].*?[^\s])~$/)
          if (strikeMatch && strikeMatch[1] && strikeMatch[1].length > 0) {
            applyMarkdownFormatting(editor, strikeMatch, 'strikethrough')
            return
          }

          // Check for code: `text`
          const codeMatch = beforeText.match(/`([^\s].*?[^\s])`$/)
          if (codeMatch && codeMatch[1] && codeMatch[1].length > 0) {
            applyMarkdownFormatting(editor, codeMatch, 'code')
            return
          }
        }
      }
    }
  }

  return editor
}
