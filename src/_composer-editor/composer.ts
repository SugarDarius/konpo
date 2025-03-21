import type { BaseEditor, Element, Descendant, Location } from 'slate'
import type { HistoryEditor } from 'slate-history'
import type { ReactEditor, RenderElementProps } from 'slate-react'
import type { ComposerText, ComposerMark } from '../types'

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
export type ComposerEditorLocation = Location

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

export {
  createEditor as createSlateEditor,
  Editor as SlateEditor,
  Transforms as SlateTransforms,
  Range as SlateRange,
  Element as SlateElement,
  Node as SlateNode,
  Path as SlatePath,
  Point as SlatePoint,
} from 'slate'
export { ReactEditor as SlateReactEditor } from 'slate-react'
