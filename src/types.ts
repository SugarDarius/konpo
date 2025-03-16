import { Primitive } from '@radix-ui/react-primitive'
import type { ComponentProps } from 'react'

export type Children = { children?: React.ReactNode }
export type DivProps = ComponentProps<typeof Primitive.div>

export interface ComposerRootProps extends DivProps, Children {
  /**
   * A callback that is called when the composer is submitted.
   */
  onSubmit?: () => void
}
