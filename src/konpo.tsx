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
import {
  KonpoEditorEditable,
  KonpoEditorWrapper,
  type KonpoEditorEditableRenderElementProps,
} from './editor'
import { useInitial } from './_hooks/use-initial'

const ComposerRoot = forwardRef<HTMLDivElement, ComposerRootProps>(
  (
    { onSubmit, disabled = false, initialValue, children, ...props },
    forwardedRef
  ) => {
    const onSubmitStable = useStableCallback(
      onSubmit ??
        createDevelopmentWarning(
          'Please provide on <Composer.Root /> an `onSubmit` callback.'
        )
    )

    const store = useCreateStore(() =>
      createKonpoStore({
        disabled,
        initialValue,
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

const ComposerEditorElement = (
  props: KonpoEditorEditableRenderElementProps
) => {
  const { element, attributes, children } = props
  switch (element.type) {
    case 'paragraph':
      return (
        <Primitive.p {...attributes} konpo-paragraph=''>
          {children}
        </Primitive.p>
      )
    default:
      return null
  }
}

const ComposerEditor = forwardRef<HTMLDivElement, ComposerEditorProps>(
  ({ dir, placeholder, children, ...props }, forwardedRef) => {
    const store = useKonpoStore()

    const editor = useSelectorKey(store, 'editor')
    const disabled = useSelectorKey(store, 'disabled')
    const initialValue = useInitial(useSelectorKey(store, 'initialValue'))

    const renderElement = useStableCallback(
      (props: KonpoEditorEditableRenderElementProps) => {
        return <ComposerEditorElement {...props} />
      }
    )

    return (
      <KonpoEditorWrapper
        editor={editor}
        initialValue={initialValue}
        onChange={() => {}}
      >
        <KonpoEditorEditable
          {...props}
          ref={forwardedRef}
          konpo-editor=''
          data-disabled={disabled}
          dir={dir}
          readOnly={disabled}
          disabled={disabled}
          placeholder={placeholder}
          renderElement={renderElement}
        />
        <Slottable>{children}</Slottable>
      </KonpoEditorWrapper>
    )
  }
)

const ComposerSubmitButton = forwardRef<
  HTMLButtonElement,
  ComposerSubmitButtonProps
>(({ asChild, disabled, ...props }, forwardedRef) => {
  const store = useKonpoStore()

  const isComposerDisabled = useSelectorKey(store, 'disabled')
  const onSubmit = useSelectorKey(store, 'onSubmit')

  const Comp = asChild ? Slot : Primitive.button
  const isDisabled = isComposerDisabled || disabled

  const handleClick = useStableCallback(
    (e: React.MouseEvent<HTMLButtonElement>): void => {
      e.preventDefault()
      onSubmit()
    }
  )

  return (
    <Comp
      {...props}
      ref={forwardedRef}
      disabled={isDisabled}
      onClick={handleClick}
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
