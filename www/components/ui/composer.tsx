'use client'

import {
  Composer as ComposerPrimitive,
  type ComposerRootProps,
  type ComposerEditorProps,
  type ComposerSubmitTriggerProps,
  type ComposerFloatingToolbarProps,
  type ComposerMarkToggleTriggerProps,
} from 'konpo'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export function Composer({ className, ...props }: ComposerRootProps) {
  return (
    <ComposerPrimitive.Root
      className={cn(
        'relative w-[480px] rounded-lg p-4 bg-background-shadow-sm flex flex-col gap-4',
        className
      )}
      {...props}
    />
  )
}

export function ComposerEditor({ className, ...props }: ComposerEditorProps) {
  return (
    <ComposerPrimitive.Editor
      className={cn(
        'rounded-md border-input px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-16 w-full resize-none border-0 focus-visible:ring-1 bg-gray-50 dark:bg-gray-900',
        '[&_[konpo-link]]:underline [&_[konpo-link]]:underline-offset-2 [&_[konpo-link]]:text-cyan-600',
        '[&_[konpo-inline-text]_code]:bg-gray-300 [&_[konpo-inline-text]_code]:p-0.5 [&_[konpo-inline-text]_code]:rounded-sm',
        className
      )}
      {...props}
    />
  )
}

export function ComposerSubmitTrigger({
  className,
  children,
  ...props
}: ComposerSubmitTriggerProps) {
  return (
    <ComposerPrimitive.SubmitTrigger {...props} asChild>
      <Button className={cn('', className)} size='sm' variant='outline'>
        {children}
      </Button>
    </ComposerPrimitive.SubmitTrigger>
  )
}

export function ComposerFloatingToolbar({
  className,
  ...props
}: ComposerFloatingToolbarProps) {
  return (
    <ComposerPrimitive.FloatingToolbar
      className={cn(
        'p-0 rounded-lg bg-muted overflow-hidden shadow-xs flex flex-row gap-0.5',
        className
      )}
      {...props}
    />
  )
}

export function ComposerToggleMarkTrigger({
  className,
  mark,
  children,
  ...props
}: ComposerMarkToggleTriggerProps) {
  return (
    <ComposerPrimitive.ToggleMarkTrigger
      mark={mark}
      {...props}
      asChild
      className={cn('', className)}
    >
      <Button
        size='icon'
        variant='ghost'
        className='data-[active="true"]:bg-primary data-[active="true"]:text-primary-foreground'
      >
        {children}
      </Button>
    </ComposerPrimitive.ToggleMarkTrigger>
  )
}
