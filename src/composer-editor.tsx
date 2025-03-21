import type { BaseEditor, Element, Descendant, Location } from 'slate'
import {
  createEditor as createSlateEditor,
  Editor as SlateEditor,
  Transforms as SlateTransforms,
  Range as SlateRange,
  Element as SlateElement,
  Node as SlateNode,
  Path as SlatePath,
  Point as SlatePoint,
} from 'slate'
import type { HistoryEditor } from 'slate-history'
import { withHistory } from 'slate-history'
import type {
  ReactEditor,
  RenderElementProps,
  RenderLeafProps,
  RenderPlaceholderProps,
} from 'slate-react'
import {
  withReact,
  Slate as SlateComponent,
  Editable as SlateEditableComponent,
  ReactEditor as SlateReactEditor,
} from 'slate-react'

import { exists } from './_utils/identity'
import { isEmptyString, isUrl } from './_utils/string'
import type {
  ComposerText,
  KonpoParagraphElement,
  KonpoInlineElement,
  KonpoLinkElement,
  KonpoText,
  KonpoComposedBody,
  KonpoBlockElement,
  ComposerMark,
  ComposerMarks,
} from './types'
import { ignoreOnThrow } from './_utils/error'

export type ComposerLinkElement = {
  type: 'link'
  url: string
  children: ComposerText[]
}

export type ComposerInlineElement = ComposerLinkElement | ComposerText

export type ComposerParagraphElement = {
  type: 'paragraph'
  children: ComposerInlineElement[]
}

export type ComposerListItemElement = {
  type: 'list-item'
  children: ComposerInlineElement[]
}

export type ComposerBulletListElement = {
  type: 'bullet-list'
  children: ComposerListItemElement[]
}

export interface ComposerEditor extends BaseEditor, ReactEditor, HistoryEditor {
  pendingPrimeMarks?: { [key in ComposerMark]?: boolean }
}
export type ComposerEditorDescendant = Descendant

declare module 'slate' {
  interface CustomTypes {
    Editor: ComposerEditor
    Element:
      | ComposerParagraphElement
      | ComposerBulletListElement
      | ComposerListItemElement
      | ComposerLinkElement
    Text: ComposerText
  }
}

declare module 'slate-react' {
  type RenderElementSpecificProps<E extends Element> = Omit<
    RenderElementProps,
    'element'
  > & { element: E }
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
const getCharacterBefore = (editor: ComposerEditor, at: Location) => {
  const before = SlateEditor.before(editor, at, { unit: 'character' })
  if (!before) {
    return
  }

  const to = SlateRange.isRange(at) ? SlateRange.start(at) : at
  const range = SlateEditor.range(editor, before, to)
  const text = SlateEditor.string(editor, range)

  return { range, text }
}
const getCharacterAfter = (
  editor: ComposerEditor,
  at: Location
): { range: SlateRange; text: string } | undefined => {
  const after = SlateEditor.after(editor, at, { unit: 'character' })
  if (!after) {
    return
  }

  const to = SlateRange.isRange(at) ? SlateRange.end(at) : at
  const range = SlateEditor.range(editor, to, after)
  const text = SlateEditor.string(editor, range)

  return { range, text }
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

export const baseComposerMarks: ComposerMarks = {
  bold: false,
  italic: false,
  strikethrough: false,
  code: false,
}

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
    } else if (isComposerParagraphElement(descendant)) {
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

const withNormalizer = (editor: ComposerEditor): ComposerEditor => {
  const { normalizeNode: baseNormalizeNode } = editor

  editor.normalizeNode = ([node, path]): void => {
    // Paragraphs must always contain only inline elements
    if (SlateElement.isElement(node) && node.type === 'paragraph') {
      for (const [child, childPath] of SlateNode.children(editor, path)) {
        if (SlateElement.isElement(child) && !editor.isInline(child)) {
          SlateTransforms.unwrapNodes(editor, { at: childPath })
          return
        }
      }
    }
    // Links cannot be nested nor empty
    if (SlateElement.isElement(node) && node.type === 'link') {
      if (
        node.children.length <= 0 ||
        (node.children.length === 1 && node.children[0]?.text === '')
      ) {
        SlateTransforms.removeNodes(editor, { at: path })
      }
    }

    baseNormalizeNode([node, path])
  }

  return editor
}

export function isComposerLinkActive(editor: ComposerEditor): boolean {
  const [link] = SlateEditor.nodes(editor, {
    match: (n) =>
      !SlateEditor.isEditor(n) &&
      SlateElement.isElement(n) &&
      n.type === 'link',
  })

  return !!link
}

const unwrapLink = (editor: ComposerEditor) => {
  SlateTransforms.unwrapNodes(editor, {
    match: (n) =>
      !SlateEditor.isEditor(n) &&
      SlateElement.isElement(n) &&
      n.type === 'link',
  })
}

const wrapComposerLink = (
  editor: ComposerEditor,
  url: string,
  text?: string
): void => {
  if (isComposerLinkActive(editor)) {
    unwrapLink(editor)
  }

  const selection = editor.selection
  const isCollapsed = selection && SlateRange.isCollapsed(selection)
  const link: ComposerLinkElement = {
    type: 'link',
    url,
    children: isCollapsed ? [{ text: text ?? url }] : [],
  }

  if (isCollapsed) {
    SlateTransforms.insertNodes(editor, link)
  } else {
    SlateTransforms.wrapNodes(editor, link, { split: true })
    SlateTransforms.collapse(editor, { edge: 'end' })
  }
}

const withAutoLink = (editor: ComposerEditor): ComposerEditor => {
  const {
    isInline: baseIsInline,
    insertText: baseInsertText,
    insertData: baseInsertData,
  } = editor

  editor.isInline = (element) => {
    return element.type === 'link' || baseIsInline(element)
  }

  editor.insertText = (text) => {
    if (
      text === ' ' &&
      editor.selection &&
      SlateRange.isCollapsed(editor.selection)
    ) {
      const [start] = SlateRange.edges(editor.selection)
      const beforeRange = SlateEditor.range(
        editor,
        { path: start.path, offset: 0 },
        start
      )
      const beforeText = SlateEditor.string(editor, beforeRange)
      const matches = beforeText.match(/(\S+)$/)

      if (matches && matches[1] && isUrl(matches[1])) {
        const url = matches[1]
        baseInsertText(text)

        SlateTransforms.move(editor, { distance: 1, reverse: true })
        SlateTransforms.select(editor, {
          anchor: { path: start.path, offset: start.offset - url.length },
          focus: { path: start.path, offset: start.offset },
        })

        wrapComposerLink(editor, url)
        SlateTransforms.move(editor)

        return
      }
    }

    baseInsertText(text)
  }

  editor.insertData = (data) => {
    const text = data.getData('text/plain')
    if (text && isUrl(text)) {
      wrapComposerLink(editor, text)
    } else {
      baseInsertData(data)
    }
  }

  return editor
}

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

const withMarkdownMarksShortcuts = (editor: ComposerEditor): ComposerEditor => {
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

const withPrimeMarks = (editor: ComposerEditor): ComposerEditor => {
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

const withBulletList = (editor: ComposerEditor): ComposerEditor => {
  const {
    insertText: baseInsertText,
    insertBreak: baseInsertBreak,
    deleteBackward: baseDeleteBackward,
    normalizeNode: baseNormalizeNode,
  } = editor
  editor.insertText = (text) => {
    const selection = editor.selection

    // We only want to handle the space character for the dash+space pattern
    if (text === ' ' && selection && SlateRange.isCollapsed(selection)) {
      const anchor = selection.anchor
      // Get the block at the current selection
      const block = SlateEditor.above(editor, {
        match: (n) =>
          SlateElement.isElement(n) && SlateEditor.isBlock(editor, n),
        at: selection,
      })

      if (block) {
        const [blockElement, blockPath] = block
        // Skip if we're already in a list item
        if (
          SlateElement.isElement(blockElement) &&
          blockElement.type === 'list-item'
        ) {
          baseInsertText(text)
          return
        }

        // Get the start point of the current block
        const start = SlateEditor.start(editor, blockPath)
        // Check if we're at the beginning of the line + 1 character (the dash)
        const isAtStartPlusOne =
          anchor.path.every((val, i) => val === start.path[i]) &&
          anchor.offset === 1

        if (isAtStartPlusOne) {
          // Get the text of the current node
          const currentNodeText = SlateNode.string(blockElement)
          // Check if the first character is a dash
          if (currentNodeText.startsWith('-') && currentNodeText.length === 1) {
            // Delete the dash
            SlateTransforms.delete(editor, {
              at: { anchor: start, focus: anchor },
            })
            // Convert the current block to a list item
            SlateTransforms.setNodes(
              editor,
              { type: 'list-item' },
              { at: blockPath }
            )
            // Wrap in a bullet list
            SlateTransforms.wrapNodes(
              editor,
              { type: 'bullet-list', children: [] },
              { at: blockPath }
            )
            return
          }
        }
      }
    }

    baseInsertText(text)
  }
  editor.insertBreak = () => {
    const selection = editor.selection
    if (selection && SlateRange.isCollapsed(selection)) {
      // Check if we're in a list item
      const item = SlateEditor.above(editor, {
        match: (n) =>
          !SlateEditor.isEditor(n) &&
          SlateElement.isElement(n) &&
          n.type === 'list-item',
        at: selection,
      })
      if (item) {
        const [itemElement, itemPath] = item
        // Check if the list item is empty
        if (SlateNode.string(itemElement).length === 0) {
          // Get the parent list
          const [list, listPath] = SlateEditor.parent(editor, itemPath)
          // If it's the only item in the list, replace it with a paragraph (because it's empty)
          if (list.children.length === 1) {
            // 1️⃣ Transform the list item to a paragraph
            SlateTransforms.setNodes(
              editor,
              { type: 'paragraph' },
              { at: itemPath }
            )
            // 2️⃣ Unwrap the list
            SlateTransforms.unwrapNodes(editor, {
              at: listPath,
              match: (n) =>
                !SlateEditor.isEditor(n) &&
                SlateElement.isElement(n) &&
                n.type === 'bullet-list',
            })
          } else {
            // If it's not the only item, remove this empty item
            // and insert a paragraph after the list
            const isLastItem =
              itemPath[itemPath.length - 1] === list.children.length - 1
            // 1️⃣ Remove the empty list item
            SlateTransforms.removeNodes(editor, { at: itemPath })
            // 2️⃣ Insert a paragraph after the list
            const insertPath = isLastItem ? SlatePath.next(listPath) : listPath
            SlateTransforms.insertNodes(
              editor,
              { type: 'paragraph', children: [{ text: '' }] },
              {
                at: insertPath,
              }
            )
          }

          return
        }

        // For non-empty list items, insert a break and ensure the new node is a list item
        // First, split the node at the current selection
        SlateTransforms.splitNodes(editor, { always: true })

        // Then ensure the new node is a list item (it should already be at the right path)
        const newItemPath = SlatePath.next(itemPath)
        SlateTransforms.setNodes(
          editor,
          { type: 'list-item' },
          { at: newItemPath }
        )
        return
      }
    }

    baseInsertBreak()
  }
  editor.deleteBackward = (unit) => {
    const selection = editor.selection

    if (selection && SlateRange.isCollapsed(selection)) {
      // Check if we're in a list item
      const listItemEntry = SlateEditor.above(editor, {
        match: (n) =>
          !SlateEditor.isEditor(n) &&
          SlateElement.isElement(n) &&
          n.type === 'list-item',
        at: selection,
      })

      if (listItemEntry) {
        const [listItem, listItemPath] = listItemEntry
        const start = SlateEditor.start(editor, listItemPath)

        // Check if cursor is at the beginning of the list item AND the list item is empty
        if (
          SlatePoint.equals(selection.anchor, start) &&
          SlateNode.string(listItem).length === 0
        ) {
          // Temporarily disable normalization
          const savedNormalizeNode = editor.normalizeNode
          editor.normalizeNode = () => {}

          try {
            // Simply convert the list item to a paragraph
            SlateTransforms.setNodes(
              editor,
              { type: 'paragraph' },
              { at: listItemPath }
            )

            // Lift it out of the list
            SlateTransforms.liftNodes(editor, { at: listItemPath })
          } finally {
            // Restore normalization
            editor.normalizeNode = savedNormalizeNode
          }

          return
        }
      }
    }

    // Default behavior for all other cases
    baseDeleteBackward(unit)
  }

  editor.normalizeNode = ([node, path]) => {
    // Only normalize Elements, not Text nodes
    if (SlateElement.isElement(node)) {
      // Case 1: Ensure list items are always inside a bulleted-list
      if (node.type === 'list-item') {
        const parent = SlateEditor.parent(editor, path)
        const [parentNode] = parent

        if (
          !SlateElement.isElement(parentNode) ||
          (SlateElement.isElement(parentNode) &&
            parentNode.type !== 'bullet-list')
        ) {
          // Wrap the list item in a bulleted list
          SlateTransforms.wrapNodes(
            editor,
            { type: 'bullet-list', children: [] },
            { at: path }
          )
          return // Return early to avoid multiple normalizations at once
        }
      }

      // Case 2: Ensure bulleted-lists only contain list-items
      if (node.type === 'bullet-list') {
        // Check if the list has any children
        if (node.children.length === 0) {
          // Remove empty lists
          SlateTransforms.removeNodes(editor, { at: path })
          return
        }

        // Check each child of the list
        for (const [child, childPath] of SlateNode.children(editor, path)) {
          if (!SlateElement.isElement(child) || child.type !== 'list-item') {
            // Convert non-list-items to list-items
            SlateTransforms.setNodes(
              editor,
              { type: 'list-item' },
              { at: childPath }
            )
            return // Return early to avoid multiple normalizations at once
          }
        }

        // Case 3: Merge adjacent bulleted lists
        const next = SlateEditor.next(editor, { at: path })
        if (next) {
          const [nextNode, nextPath] = next

          if (
            SlateElement.isElement(nextNode) &&
            nextNode.type === 'bullet-list'
          ) {
            // Merge the two lists
            SlateTransforms.mergeNodes(editor, { at: nextPath })
            return
          }
        }
      }

      // Case 4: Handle invalid list items (empty ones that aren't being edited)
      if (node.type === 'list-item') {
        // Check if the list item has any content or is currently selected
        const isEmpty = SlateNode.string(node).length === 0
        const isSelected =
          editor.selection &&
          SlatePath.isDescendant(editor.selection.anchor.path, path)

        if (isEmpty && !isSelected) {
          // Find the parent list
          const [list, listPath] = SlateEditor.parent(editor, path)

          // If this is the only item in the list, remove the entire list
          if (list.children.length === 1) {
            SlateTransforms.removeNodes(editor, { at: listPath })
          } else {
            // Otherwise, just remove this empty item
            SlateTransforms.removeNodes(editor, { at: path })
          }
          return
        }
      }

      // Case 5: Handle nested list items
      if (node.type === 'list-item') {
        // Check if any children are list items
        for (const [child, childPath] of SlateNode.children(editor, path)) {
          if (SlateElement.isElement(child) && child.type === 'list-item') {
            // Lift the nested list item up to be a sibling
            SlateTransforms.liftNodes(editor, { at: childPath })
            return
          }
        }
      }
    }

    // Continue with the original normalization
    baseNormalizeNode([node, path])
  }

  return editor
}

export function createComposerEditor(): ComposerEditor {
  return withNormalizer(
    withAutoLink(
      withMarkdownMarksShortcuts(
        withBulletList(
          withPrimeMarks(
            withHistory(withReact(createSlateEditor() as ComposerEditor))
          )
        )
      )
    )
  )
}

export const ComposerEditorComponent = (props: {
  editor: ComposerEditor
  initialValue: ComposerEditorDescendant[]
  onChange: (value: ComposerEditorDescendant[]) => void
  children: React.ReactNode
}) => <SlateComponent {...props} />

type ComposerEditorEditableProps = React.ComponentProps<
  typeof SlateEditableComponent
>
export const ComposerEditorEditable = (props: ComposerEditorEditableProps) => (
  <SlateEditableComponent {...props} />
)

// TODO: add more properties like mentions, links, etc.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ComposerEditorEditableRenderElementProps
  extends RenderElementProps {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ComposerEditorEditableRenderLeafProps
  extends RenderLeafProps {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ComposerEditorEditableRenderPlaceholderProps
  extends RenderPlaceholderProps {}

const isKonpoText = (inline: KonpoInlineElement): inline is KonpoText =>
  !('type' in inline) &&
  inline.text !== undefined &&
  typeof inline.text === 'string'

const isKonpoLink = (inline: KonpoInlineElement): inline is KonpoLinkElement =>
  'type' in inline && inline.type === 'link'

const isKonpoParagraphElement = (
  element: KonpoBlockElement
): element is KonpoParagraphElement => element.type === 'paragraph'

export function toComposerEditorDescendants(
  body: KonpoComposedBody
): ComposerEditorDescendant[] {
  if (body.content.length <= 0) {
    return []
  }

  return body.content
    .map((block) => {
      if (!isKonpoParagraphElement(block)) {
        return null
      }

      const descendants = block.children
        .map((inline): ComposerText | ComposerLinkElement | null => {
          if (isKonpoText(inline)) {
            return { ...inline }
          }

          if (isKonpoLink(inline)) {
            return {
              type: 'link',
              url: inline.url,
              children: [{ text: inline.text }],
            }
          }

          return null
        })
        .filter(exists)

      return {
        ...block,
        descendants,
      }
    })
    .filter(exists)
}

const isComposerParagraphElement = (
  element: ComposerEditorDescendant
): element is ComposerParagraphElement =>
  'type' in element && element.type === 'paragraph'

const isComposerText = (
  element: ComposerEditorDescendant
): element is ComposerText =>
  !('type' in element) && 'text' in element && typeof element.text === 'string'

const isComposerLink = (
  element: ComposerEditorDescendant
): element is ComposerLinkElement =>
  'type' in element && element.type === 'link'

export function toKonpoComposedBody(
  children: ComposerEditorDescendant[]
): KonpoComposedBody {
  if (children.length <= 0) {
    return { content: [] }
  }

  return {
    content: children
      .map((descendant) => {
        if (isComposerParagraphElement(descendant)) {
          return {
            type: 'paragraph',
            children: descendant.children
              .map((inline): KonpoText | KonpoLinkElement | null => {
                if (isComposerText(inline)) {
                  return { ...inline }
                }

                if (isComposerLink(inline)) {
                  return {
                    type: 'link',
                    url: inline.url,
                    text: inline.children[0]?.text ?? '',
                  }
                }

                return null
              })
              .filter(exists),
          }
        }

        return null
      })
      // TODO: temp type assertion until I add more block elements
      .filter(exists) as KonpoBlockElement[],
  }
}
