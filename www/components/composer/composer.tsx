'use client'

import {
  Awaitable,
  Composer as ComposerPrimitive,
  KonpoComposedBody,
} from 'konpo'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export function Composer({
  className,
  disabled,
  initialValue,
  onSubmit,
  children,
}: {
  className?: string
  disabled?: boolean
  initialValue?: KonpoComposedBody
  onSubmit: (body: KonpoComposedBody) => Awaitable<void>
  children?: React.ReactNode
}) {
  return (
    <ComposerPrimitive.Root
      className={cn(
        'relative w-[380px] rounded-lg p-4 bg-background-shadow-sm flex flex-col gap-4',
        className
      )}
      disabled={disabled}
      initialValue={initialValue}
      onSubmit={onSubmit}
    >
      {children}
    </ComposerPrimitive.Root>
  )
}

export function ComposerEditor({
  className,
  autoFocus,
  placeholder,
}: {
  className?: string
  autoFocus?: boolean
  placeholder?: string
}) {
  return (
    <ComposerPrimitive.Editor
      className={cn(
        'rounded-md border-input px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-16 w-full resize-none border-0 focus-visible:ring-1 bg-gray-50 dark:bg-gray-900',
        className
      )}
      autoFocus={autoFocus}
      placeholder={placeholder}
    />
  )
}

export function ComposerSubmitTrigger({
  className,
  children,
}: {
  className?: string
  children?: React.ReactNode
}) {
  return (
    <ComposerPrimitive.SubmitTrigger asChild>
      <Button className={cn('', className)} size='sm' variant='outline'>
        {children}
      </Button>
    </ComposerPrimitive.SubmitTrigger>
  )
}
