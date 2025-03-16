import {
  createEditor as createSlateEditor,
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
} from 'slate-react'

import { exists } from './_utils/exists'
import type {
  KonpoInlineElement,
  KonpoParagraphElement,
  KonpoText,
  KonpoComposedBody,
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

export const KonpoEditorEditable = (
  props: React.ComponentProps<typeof Editable>
) => <Editable {...props} />

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
