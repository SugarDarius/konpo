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
} from 'slate-react'

import type { KonpoParagraphElement, KonpoText } from './types'

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
