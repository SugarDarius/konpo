'use client'

import { forwardRef, useLayoutEffect } from 'react'

import { Primitive } from '@radix-ui/react-primitive'
import { Slottable, Slot } from '@radix-ui/react-slot'
import { Portal } from '@radix-ui/react-portal'

import {
  useFloating,
  useDismiss,
  useInteractions,
  flip,
  shift,
  inline,
  autoUpdate,
  size,
} from '@floating-ui/react'

import { useIsomorphicLayoutEffect } from './_hooks/use-isomorphic-layout-effect'
import { useStableCallback } from './_hooks/use-stable-callback'

import type {
  ComposerRootProps,
  ComposerLinkProps,
  ComposerEditorProps,
  ComposerSubmitTriggerProps,
  ComposerMarkToggleTriggerProps,
  ComposerFloatingToolbarProps,
} from './types'
import { createDevelopmentWarning } from './_utils/warning'
import { useCreateStore, useSelectorKey } from './_utils/create-store'
import { createKonpoStore, KonpoStoreProvider, useKonpoStore } from './store'
import type {
  ComposerEditorEditableRenderElementProps,
  ComposerEditorEditableRenderLeafProps,
  ComposerEditorEditableRenderPlaceholderProps,
} from './_composer-editor/components'
import {
  ComposerEditorEditable,
  ComposerEditorComponent,
} from './_composer-editor/components'

import { useInitial } from './_hooks/use-initial'
import { useContentZIndex } from './_hooks/use-content-z-index'
import { useComposedRefs } from './_hooks/use-composed-refs'

/**
 * Adds the root of the composer.
 *
 * It will create a store to manage the state of the composer.
 * This component is required to use the other components.
 *
 * @example
 * ```tsx
 * <Composer.Root onSubmit={(body) => console.log(body)}>
 *   <Composer.Editor placeholder='Write a message...' />
 *   <Composer.SubmitButton>Send</Composer.SubmitButton>
 * </Composer.Root>
 * ```
 */
const ComposerRoot = forwardRef<HTMLDivElement, ComposerRootProps>(
  (
    {
      onSubmit,
      disabled = false,
      initialValue,
      shortcuts,
      keepFocusOnSubmit = true,
      withBulletList = true,
      withMarkdownMarksShortcuts = true,
      children,
      ...props
    },
    forwardedRef
  ) => {
    const stableOnSubmit = useStableCallback(
      onSubmit ??
        createDevelopmentWarning(
          'Please provide on <Composer.Root /> an `onSubmit` callback.'
        )
    )
    const store = useCreateStore(() =>
      createKonpoStore({
        initialDisabled: disabled,
        initialValue,
        initialShortcuts: shortcuts,
        keepFocusOnSubmit,
        handleSubmit: stableOnSubmit,
        useBulletList: withBulletList,
        useMarkdownMarksShortcuts: withMarkdownMarksShortcuts,
      })
    )
    return (
      <Primitive.div
        {...props}
        ref={forwardedRef}
        konpo-root=''
        style={{ position: 'relative' }}
      >
        <KonpoStoreProvider store={store}>
          <Slottable>{children}</Slottable>
        </KonpoStoreProvider>
      </Primitive.div>
    )
  }
)

/**
 * Adds a link to the composer.
 *
 * @example
 * ```tsx
 * <Composer.Link href='https://example.com'>Example</Composer.Link>
 * ```
 */
const ComposerLink = forwardRef<HTMLAnchorElement, ComposerLinkProps>(
  ({ asChild, ...props }, forwardedRef) => {
    const Comp = asChild ? Slot : Primitive.a
    return (
      <Comp
        {...props}
        ref={forwardedRef}
        target='_blank'
        rel='noopener noreferrer nofollow'
        konpo-link=''
      />
    )
  }
)

interface ComposerEditorElementProps
  extends ComposerEditorEditableRenderElementProps {
  components?: {
    Link?: React.ComponentType<ComposerLinkProps>
  }
}

const ComposerEditorElement = ({
  element,
  attributes,
  children,
  components = {},
}: ComposerEditorElementProps) => {
  const { Link = ComposerLink } = components
  switch (element.type) {
    case 'paragraph':
      return (
        <Primitive.p
          {...attributes}
          konpo-paragraph=''
          style={{ position: 'relative' }}
        >
          {children}
        </Primitive.p>
      )
    case 'link':
      return (
        <Primitive.span {...attributes}>
          <Link href={element.url}>{children}</Link>
        </Primitive.span>
      )
    case 'bullet-list':
      return (
        <Primitive.ul
          {...attributes}
          konpo-bullet-list=''
          style={{ position: 'relative' }}
        >
          {children}
        </Primitive.ul>
      )
    case 'list-item':
      return (
        <Primitive.li
          {...attributes}
          konpo-list-item=''
          style={{ position: 'relative' }}
        >
          {children}
        </Primitive.li>
      )
    default:
      return null
  }
}

/**
 * Renders a leaf of the editor follow this schema 👇🏻
 * ```html
 * <code><s><em><strong>{element.text}</strong></s></em></code>
 * ```
 */
const ComposerEditorLeaf = ({
  leaf,
  attributes,
  children,
}: ComposerEditorEditableRenderLeafProps) => {
  let content = children
  if (leaf.bold) {
    content = <strong>{content}</strong>
  }
  if (leaf.italic) {
    content = <em>{content}</em>
  }
  if (leaf.strikethrough) {
    content = <s>{content}</s>
  }
  if (leaf.code) {
    content = <code>{content}</code>
  }

  return (
    <Primitive.span {...attributes} konpo-inline-text=''>
      {content}
    </Primitive.span>
  )
}

const ComposerEditorPlaceholder = ({
  attributes,
  children,
}: ComposerEditorEditableRenderPlaceholderProps) => {
  return (
    <Primitive.span {...attributes} konpo-placeholder=''>
      {children}
    </Primitive.span>
  )
}

/**
 * Adds the composer's editor.
 *
 * This component is responsible for rendering the editor.
 * It uses Slate's `Editable` component under the hood.
 *
 * @example
 * ```tsx
 * <Composer.Editor placeholder='Write a message...' />
 * ```
 */
const ComposerEditor = forwardRef<HTMLDivElement, ComposerEditorProps>(
  (
    {
      placeholder,
      autoFocus = false,
      dir,
      components,
      onFocus,
      onBlur,
      onKeyDown,
      ...props
    },
    forwardedRef
  ) => {
    const store = useKonpoStore()

    const editor = useSelectorKey(store, 'editor')
    const disabled = useSelectorKey(store, 'disabled')
    const focused = useSelectorKey(store, 'focused')

    const initialValue = useInitial(useSelectorKey(store, 'initialValue'))
    const focus = useStableCallback(useSelectorKey(store, 'focus'))
    const blur = useStableCallback(useSelectorKey(store, 'blur'))
    const handleKeyboardKeys = useStableCallback(
      useSelectorKey(store, 'handleKeyboardKeys')
    )

    const handleChange = useStableCallback(useSelectorKey(store, 'assert'))
    const handleFocus = useStableCallback(
      (e: React.FocusEvent<HTMLDivElement>) => {
        onFocus?.(e)
        if (!e.isDefaultPrevented()) {
          focus()
        }
      }
    )
    const handleBlur = useStableCallback(
      (e: React.FocusEvent<HTMLDivElement>) => {
        onBlur?.(e)
        if (!e.isDefaultPrevented()) {
          blur()
        }
      }
    )

    const handleKeyDown = useStableCallback(
      (e: React.KeyboardEvent<HTMLDivElement>): void => {
        onKeyDown?.(e)
        handleKeyboardKeys(e)
      }
    )

    const renderElement = useStableCallback(
      (props: ComposerEditorEditableRenderElementProps) => (
        <ComposerEditorElement {...props} components={components} />
      )
    )

    const renderLeaf = useStableCallback(
      (props: ComposerEditorEditableRenderLeafProps) => (
        <ComposerEditorLeaf {...props} />
      )
    )

    const renderPlaceholder = useStableCallback(
      (props: ComposerEditorEditableRenderPlaceholderProps) => (
        <ComposerEditorPlaceholder {...props} />
      )
    )

    useIsomorphicLayoutEffect(() => {
      if (autoFocus) {
        focus()
      }
    }, [autoFocus, focus])

    return (
      <ComposerEditorComponent
        editor={editor}
        initialValue={initialValue}
        onChange={handleChange}
      >
        <ComposerEditorEditable
          {...props}
          ref={forwardedRef}
          konpo-editable=''
          data-disabled={disabled || undefined}
          data-focused={focused || undefined}
          disableDefaultStyles={true}
          style={{
            position: 'relative',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
          }}
          dir={dir}
          readOnly={disabled}
          disabled={disabled}
          placeholder={placeholder}
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          renderPlaceholder={renderPlaceholder}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
      </ComposerEditorComponent>
    )
  }
)

/**
 * Adds a submit trigger to the composer.
 *
 * It will be disabled if the composer is disabled or the editor is empty
 * or you explicitly set the `disabled` prop.
 *
 * @example
 * ```tsx
 * <Composer.SubmitTrigger>Send</Composer.SubmitTrigger>
 * ```
 */
const ComposerSubmitTrigger = forwardRef<
  HTMLButtonElement,
  ComposerSubmitTriggerProps
>(({ asChild, disabled, onClick, ...props }, forwardedRef) => {
  const store = useKonpoStore()

  const isComposerDisabled = useSelectorKey(store, 'disabled')
  const canComposerSubmit = useSelectorKey(store, 'canSubmit')
  const onSubmit = useSelectorKey(store, 'onSubmit')

  const Comp = asChild ? Slot : Primitive.button
  const isDisabled = isComposerDisabled || disabled || !canComposerSubmit

  const handleClick = useStableCallback(
    (e: React.MouseEvent<HTMLButtonElement>): void => {
      onClick?.(e)
      if (!e.isDefaultPrevented()) {
        onSubmit()
      }
    }
  )

  return (
    <Comp
      {...props}
      ref={forwardedRef}
      disabled={isDisabled}
      data-disabled={isDisabled || undefined}
      onClick={handleClick}
      konpo-submit-trigger=''
    />
  )
})

/**
 * Adds a mark toggle trigger to the composer.
 *
 * This component is responsible for toggling a mark in the editor.
 * Available marks are: bold, italic, strikethrough, and code.
 *
 * @example
 * ```tsx
 * <Composer.ToggleMarkTrigger mark='bold'>Bold</Composer.ToggleMarkTrigger>
 * ```
 */
const ComposerToggleMarkTrigger = forwardRef<
  HTMLButtonElement,
  ComposerMarkToggleTriggerProps
>(
  (
    { mark, asChild, onClick, onPointerDown, disabled, ...props },
    forwardedRef
  ) => {
    const store = useKonpoStore()

    const isComposerDisabled = useSelectorKey(store, 'disabled')
    const selectedMarks = useSelectorKey(store, 'selectedMarks')
    const toggleMark = useStableCallback(useSelectorKey(store, 'toggleMark'))

    const current = selectedMarks[mark]

    const handleClick = useStableCallback(
      (e: React.MouseEvent<HTMLButtonElement>): void => {
        onClick?.(e)
        if (!e.isDefaultPrevented()) {
          e.preventDefault()
          e.stopPropagation()

          toggleMark(mark)
        }
      }
    )

    const handlePointerDown = useStableCallback(
      (e: React.PointerEvent<HTMLButtonElement>): void => {
        onPointerDown?.(e)

        e.preventDefault()
        e.stopPropagation()
      }
    )

    const Comp = asChild ? Slot : Primitive.button
    const isDisabled = isComposerDisabled || disabled
    const isActive = !isDisabled && current

    return (
      <Comp
        {...props}
        ref={forwardedRef}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        disabled={isDisabled}
        data-active={isActive || undefined}
        data-disabled={isDisabled || undefined}
        konpo-toggle-mark-trigger=''
      />
    )
  }
)

/**
 * Adds a floating toolbar to the composer.
 * It will be rendered outside the root of the composer thanks to a portal.
 *
 * @example
 * ```tsx
 * <Composer.Root>
 *  <Composer.FloatingToolbar>
 *    <Composer.ToggleMarkTrigger mark='bold'>Bold</Composer.ToggleMarkTrigger>
 *    <Composer.ToggleMarkTrigger mark='italic'>Italic</Composer.ToggleMarkTrigger>
 *    <Composer.ToggleMarkTrigger mark='strikethrough'>Strikethrough</Composer.ToggleMarkTrigger>
 *    <Composer.ToggleMarkTrigger mark='code'>Code</Composer.ToggleMarkTrigger>
 *  </Composer.FloatingToolbar>
 * </Composer.Root />
 * ```
 */
const ComposerFloatingToolbar = forwardRef<
  HTMLDivElement,
  ComposerFloatingToolbarProps
>(({ asChild, ...props }, forwardedRef) => {
  const store = useKonpoStore()

  const isSelectionRangeActive = useSelectorKey(store, 'isSelectionRangeActive')
  const isFocused = useSelectorKey(store, 'focused')
  const activeSelectionRange = useSelectorKey(store, 'activeSelectionRange')

  const [contentRef, contentZIndex] = useContentZIndex()
  const mergedRefs = useComposedRefs(forwardedRef, (node) => {
    contentRef(node)
  })

  const isOpen = isSelectionRangeActive && isFocused

  const { refs, floatingStyles, context, placement } = useFloating({
    strategy: 'fixed',
    placement: 'top',
    open: isOpen,
    middleware: [
      inline(),
      flip(),
      shift(),
      size({
        padding: 8,
        apply: ({ availableWidth, availableHeight, elements }) => {
          elements.floating.style.setProperty(
            '--konpo-composer-floating-toolbar-available-width',
            `${availableWidth}px`
          )
          elements.floating.style.setProperty(
            '--konpo-composer-floating-toolbar-available-height',
            `${availableHeight}px`
          )
        },
      }),
    ],
    whileElementsMounted: (...args) =>
      autoUpdate(...args, { animationFrame: true }),
  })
  const dismiss = useDismiss(context)
  const { getFloatingProps } = useInteractions([dismiss])

  useLayoutEffect(() => {
    if (activeSelectionRange !== null) {
      refs.setReference({
        getBoundingClientRect: () =>
          activeSelectionRange.getBoundingClientRect(),
        getClientRects: () => activeSelectionRange.getClientRects(),
      })
    }
  }, [activeSelectionRange])

  const Comp = asChild ? Slot : Primitive.div
  const [side, align = 'center'] = placement.split('-')

  return isOpen ? (
    <Portal
      ref={refs.setFloating}
      style={{
        ...floatingStyles,
        minWidth: 'max-content',
        zIndex: contentZIndex,
      }}
      {...getFloatingProps()}
    >
      <Comp
        {...props}
        ref={mergedRefs}
        data-side={side}
        data-align={align}
        konpo-floating-toolbar=''
      />
    </Portal>
  ) : null
})

ComposerRoot.displayName = 'Composer.Root'
ComposerEditor.displayName = 'Composer.Editor'
ComposerSubmitTrigger.displayName = 'Composer.ComposerSubmitTrigger'
ComposerToggleMarkTrigger.displayName = 'Composer.ToggleMarkTrigger'
ComposerFloatingToolbar.displayName = 'Composer.FloatingToolbar'

export {
  ComposerRoot as Root,
  ComposerLink as Link,
  ComposerEditor as Editor,
  ComposerSubmitTrigger as SubmitTrigger,
  ComposerToggleMarkTrigger as ToggleMarkTrigger,
  ComposerFloatingToolbar as FloatingToolbar,
}
