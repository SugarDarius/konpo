'use client'

import { forwardRef } from 'react'
import { Primitive } from '@radix-ui/react-primitive'
import { Slottable, Slot } from '@radix-ui/react-slot'

import { useStableCallback } from './_hooks/use-stable-callback'

import type {
  ComposerRootProps,
  ComposerEditorProps,
  ComposerSubmitButtonProps,
} from './types'
import { createDevelopmentWarning } from './_utils/warning'
import { useCreateStore, useSelectorKey } from './_utils/create-store'
import { createKonpoStore, KonpoStoreProvider, useKonpoStore } from './store'

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
      <Primitive.div {...props} ref={forwardedRef} konpo-root=''>
        <KonpoStoreProvider store={store}>
          <Slottable>{children}</Slottable>
        </KonpoStoreProvider>
      </Primitive.div>
    )
  }
)

const ComposerEditor = forwardRef<HTMLDivElement, ComposerEditorProps>(
  ({ dir, placeholder, children, ...props }, forwardedRef) => {
    return (
      <Primitive.div {...props} ref={forwardedRef} konpo-editor=''>
        <Slottable>{children}</Slottable>
      </Primitive.div>
    )
  }
)

const ComposerSubmitButton = forwardRef<
  HTMLButtonElement,
  ComposerSubmitButtonProps
>(({ asChild, disabled, ...props }, forwardedRef) => {
  const store = useKonpoStore()
  const isComposerDisabled = useSelectorKey(store, 'disabled')

  const Comp = asChild ? Slot : Primitive.button
  const isDisabled = isComposerDisabled || disabled

  return (
    <Comp
      {...props}
      ref={forwardedRef}
      disabled={isDisabled}
      konpo-submit-button=''
    />
  )
})

ComposerRoot.displayName = 'Composer.Root'
ComposerEditor.displayName = 'Composer.Editor'
ComposerSubmitButton.displayName = 'Composer.SubmitButton'

export {
  ComposerRoot as Root,
  ComposerEditor as Editor,
  ComposerSubmitButton as SubmitButton,
}
