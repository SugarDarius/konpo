import { Primitive } from '@radix-ui/react-primitive'
import type { ComponentProps, ReactNode } from 'react'

export type KonpoText = {
  bold?: boolean
  italic?: boolean
  strikethrough?: boolean
  code?: boolean
  text: string
}

export type KonpoInlineElement = KonpoText

export type KonpoParagraphElement = {
  type: 'paragraph'
  children: KonpoInlineElement[]
}

export type KonpoBlockElement = KonpoParagraphElement
export type KonpoComposedBody = {
  content: KonpoBlockElement[]
  // TODO: add more properties if I feel the need to
}

export type Children = { children?: ReactNode }

export type DivProps = ComponentProps<typeof Primitive.div>
export type ButtonProps = ComponentProps<typeof Primitive.button>

export type Direction = 'ltr' | 'rtl'

export interface ComposerRootProps
  extends Omit<DivProps, 'onSubmit'>,
    Children {
  /**
   * Whether the composer is disabled.
   */
  disabled?: boolean
  /**
   * A callback that is called when the composer is submitted.
   */
  onSubmit?: (body: KonpoComposedBody) => void
  /**
   * Composer initial content.
   */
  initialValue?: KonpoComposedBody
}

export interface ComposerEditorProps extends DivProps {
  /**
   * Reading direction of the editor.
   */
  dir?: Direction

  /**
   * Placeholder text when the editor is empty.
   */
  placeholder?: string
}

export interface ComposerSubmitButtonProps extends ButtonProps, Children {
  // TODO: add keyboard shortcut to submit
}
