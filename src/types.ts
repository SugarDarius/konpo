import { Primitive } from '@radix-ui/react-primitive'
import type { ComponentProps } from 'react'

export type Children = { children?: React.ReactNode }
export type DivProps = ComponentProps<typeof Primitive.div>

export type Direction = 'ltr' | 'rtl'

export interface ComposerRootProps extends DivProps, Children {
  /**
   * Whether the composer is disabled.
   */
  disabled?: boolean
  /**
   * A callback that is called when the composer is submitted.
   */
  onSubmit?: () => void
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
