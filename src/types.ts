import { Primitive } from '@radix-ui/react-primitive'
import type { ComponentProps } from 'react'

export type DivProps = ComponentProps<typeof Primitive.div>

export interface ComposerRootProps extends DivProps {
  /**
   * A callback that is called when the composer is submitted.
   */
  onSubmit?: () => void
}
