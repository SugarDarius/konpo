import {
  createEditor as createSlateEditor,
  Editor as SlateEditor,
  Transforms as SlateTransforms,
  type BaseEditor,
  type Element,
  type Descendant,
} from 'slate'
import { withHistory, type HistoryEditor } from 'slate-history'
import {
  withReact,
  type ReactEditor,
  type RenderElementProps,
  Slate,
  Editable,
  type RenderLeafProps,
  type RenderPlaceholderProps,
  ReactEditor as SlateReactEditor,
} from 'slate-react'

import { exists } from './_utils/identity'
import { isEmptyString } from './_utils/string'
import type {
  KonpoInlineElement,
  KonpoParagraphElement,
  KonpoText,
  KonpoComposedBody,
  KonpoBlockElement,
} from './types'
import { ignoreOnThrow } from './_utils/error'

export type ComposerText = {
  bold?: boolean
  italic?: boolean
  strikethrough?: boolean
  code?: boolean
  text: string
}

export type ComposerInlineElement = ComposerText
export type ComposerParagraphElement = {
  type: 'paragraph'
  children: ComposerInlineElement[]
}

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor
    Element: ComposerParagraphElement
    Text: ComposerText
  }
}

declare module 'slate-react' {
  type RenderElementSpecificProps<E extends Element> = Omit<
    RenderElementProps,
    'element'
  > & { element: E }
}

export function createComposerEditor() {
  return withHistory(withReact(createSlateEditor()))
}

export type ComposerEditor = ReturnType<typeof createComposerEditor>
export type ComposerEditorDescendant = Descendant

export const ComposerEditorWrapper = (props: {
  editor: ComposerEditor
  initialValue: ComposerEditorDescendant[]
  onChange: (value: ComposerEditorDescendant[]) => void
  children: React.ReactNode
}) => <Slate {...props} />

type ComposerEditorEditableProps = React.ComponentProps<typeof Editable>
export const ComposerEditorEditable = (props: ComposerEditorEditableProps) => (
  <Editable {...props} />
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
  inline.text !== undefined && typeof inline.text === 'string'

export function toComposerEditorDescendants(
  body: KonpoComposedBody
): ComposerEditorDescendant[] {
  if (body.content.length <= 0) {
    return []
  }

  return body.content
    .map((block) => {
      if (block.type !== 'paragraph') {
        return null
      }

      const descendants = block.children
        .map((inline) => {
          if (isKonpoText(inline)) {
            return inline
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
): element is KonpoParagraphElement =>
  'type' in element && element.type === 'paragraph'

const isComposerText = (
  element: ComposerEditorDescendant
): element is KonpoText =>
  !('type' in element) && 'text' in element && typeof element.text === 'string'

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
              .map((inline) => {
                if (isComposerText(inline)) {
                  return inline
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
    }
  }

  return true
}

// Slate's DOM-specific operations can throw errors
// in case the editor's DOM node can no longer exists if the composer
// is unmounted before the operation is completed.
// We can ignore these errors and log them in development 👇🏻
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
export function focusKonpoEditor(
  editor: ComposerEditor,
  resetSelection = true
): void {
  ignoreOnThrow(
    "Failed to clear composer's editor, '<Composer.Root />' may be unmounted.",
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
