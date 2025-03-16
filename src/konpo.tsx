'use client'

import { forwardRef } from 'react'
import { Primitive } from '@radix-ui/react-primitive'

import { useStableCallback } from './_hooks/use-stable-callback'

import type { ComposerRootProps } from './types'
import { createDevelopmentWarning } from './_utils/warning'

const ComposerRoot = forwardRef<HTMLDivElement, ComposerRootProps>(
  ({ onSubmit, children, ...props }, forwardedRef) => {
    const onSubmitStable = useStableCallback(
      onSubmit ??
        createDevelopmentWarning(
          'Please provide on <Composer.Root /> an `onSubmit` callback.'
        )
    )
    return <Primitive.div ref={forwardedRef}>{children}</Primitive.div>
  }
)

ComposerRoot.displayName = 'Composer.Root'

export { ComposerRoot as Root }
