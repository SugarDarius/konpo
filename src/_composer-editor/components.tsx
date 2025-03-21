import type {
  RenderElementProps,
  RenderLeafProps,
  RenderPlaceholderProps,
} from 'slate-react'
import {
  Slate as SlateComponent,
  Editable as SlateEditableComponent,
} from 'slate-react'

import type { ComposerEditor, ComposerEditorDescendant } from './composer'

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
