'use client'

import { forwardRef } from 'react'
import { Primitive } from '@radix-ui/react-primitive'
import { Slottable } from '@radix-ui/react-slot'

import { useStableCallback } from './_hooks/use-stable-callback'

import type { ComposerRootProps } from './types'
import { createDevelopmentWarning } from './_utils/warning'
import { useCreateStore } from './_utils/create-store'
import { createKonpoStore, KonpoStoreProvider } from './store'

const ComposerRoot = forwardRef<HTMLDivElement, ComposerRootProps>(
  ({ onSubmit, disabled = false, children, ...props }, forwardedRef) => {
    const onSubmitStable = useStableCallback(
      onSubmit ??
        createDevelopmentWarning(
          'Please provide on <Composer.Root /> an `onSubmit` callback.'
        )
    )

    const store = useCreateStore(() =>
      createKonpoStore({
        disabled,
        onSubmit: onSubmitStable,
      })
    )
    return (
      <Primitive.div ref={forwardedRef} {...props} konpo-root=''>
        <KonpoStoreProvider store={store}>
          <Slottable>{children}</Slottable>
        </KonpoStoreProvider>
      </Primitive.div>
    )
  }
)

ComposerRoot.displayName = 'Composer.Root'

export { ComposerRoot as Root }
