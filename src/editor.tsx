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

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor
    Element: KonpoParagraphElement
    Text: KonpoText
  }
}

declare module 'slate-react' {
  type RenderElementSpecificProps<E extends Element> = Omit<
    RenderElementProps,
    'element'
  > & { element: E }
}

export function createKonpoEditor() {
  return withHistory(withReact(createSlateEditor()))
}

export type KonpoEditor = ReturnType<typeof createKonpoEditor>
export type KonpoEditorDescendant = Descendant

export const KonpoEditorWrapper = (props: {
  editor: KonpoEditor
  initialValue: KonpoEditorDescendant[]
  onChange: (value: KonpoEditorDescendant[]) => void
  children: React.ReactNode
}) => <Slate {...props} />

type KonpoEditorEditableProps = React.ComponentProps<typeof Editable>
export const KonpoEditorEditable = (props: KonpoEditorEditableProps) => (
  <Editable {...props} />
)

// TODO: add more properties like mentions, links, etc.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface KonpoEditorEditableRenderElementProps
  extends RenderElementProps {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface KonpoEditorEditableRenderLeafProps extends RenderLeafProps {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface KonpoEditorEditableRenderPlaceholderProps
  extends RenderPlaceholderProps {}

const isKonpoText = (inline: KonpoInlineElement): inline is KonpoText =>
  inline.text !== undefined && typeof inline.text === 'string'

export function toKonpoEditorDescendants(
  body: KonpoComposedBody
): KonpoEditorDescendant[] {
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
  element: KonpoEditorDescendant
): element is KonpoParagraphElement =>
  'type' in element && element.type === 'paragraph'

const isComposerText = (element: KonpoEditorDescendant): element is KonpoText =>
  !('type' in element) && 'text' in element && typeof element.text === 'string'

export function toKonpoComposedBody(
  children: KonpoEditorDescendant[]
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
export function isKonpoEditorEmpty(
  editor: KonpoEditor,
  descendants: KonpoEditorDescendant[]
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
      if (!isKonpoEditorEmpty(editor, descendant.children)) {
        return false
      }
    }
  }

  return true
}

export function clearKonpoEditor(editor: KonpoEditor): void {
  SlateTransforms.delete(editor, {
    at: {
      anchor: SlateEditor.start(editor, []),
      focus: SlateEditor.end(editor, []),
    },
  })
}
