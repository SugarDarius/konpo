import { Primitive } from '@radix-ui/react-primitive'
import type { ComponentProps, ReactNode } from 'react'

import type { Hotkeys } from './_utils/keyboard'
import type { ComposerMark } from './composer-editor'

export type Awaitable<T> = T | Promise<T>

export type KonpoText = {
  bold?: boolean
  italic?: boolean
  strikethrough?: boolean
  code?: boolean
  text: string
}

export type KonpoInlineElement = KonpoText

export type KonpoParagraphElement = {
  type: 'paragraph'
  children: KonpoInlineElement[]
}

export type KonpoBlockElement = KonpoParagraphElement
export type KonpoComposedBody = {
  content: KonpoBlockElement[]
  // TODO: add more properties if I feel the need to
}

export type Children = { children?: ReactNode }

export type DivProps = ComponentProps<typeof Primitive.div>
export type ButtonProps = ComponentProps<typeof Primitive.button>

export type Direction = 'ltr' | 'rtl'

export type ComposerShortcuts = {
  /**
   * Hotkeys to submit the composer.
   */
  submit?: Hotkeys
  /**
   * Hotkeys to add a new paragraph.
   */
  hardBreak?: Hotkeys
  /**
   * Hotkeys to add a new line in the current paragraph.
   */
  softBreak?: Hotkeys
  /**
   * Hotkeys to toggle bold mark.
   */
  boldMark?: Hotkeys
  /**
   * Hotkeys to toggle italic mark.
   */
  italicMark?: Hotkeys
  /**
   * Hotkeys to toggle strikethrough mark.
   */
  strikethroughMark?: Hotkeys
  /**
   * Hotkeys to toggle code mark.
   */
  codeMark?: Hotkeys
}

export interface ComposerRootProps
  extends Omit<DivProps, 'onSubmit'>,
    Children {
  /**
   * Whether the composer is disabled.
   */
  disabled?: boolean
  /**
   * Composer initial content.
   */
  initialValue?: KonpoComposedBody
  /**
   * Hotkeys for the composer.
   */
  shortcuts?: ComposerShortcuts
  /**
   * A callback that is called when the composer is submitted.
   */
  onSubmit?: (body: KonpoComposedBody) => Awaitable<void>
}

export interface ComposerEditorProps extends DivProps {
  /**
   * Placeholder text when the editor is empty.
   */
  placeholder?: string
  /**
   * Autofocus editor when it mounts.
   */
  autoFocus?: boolean
  /**
   * Reading direction of the editor.
   */
  dir?: Direction
}

export interface ComposerSubmitTriggerProps extends ButtonProps, Children {}

export interface ComposerMarkToggleTriggerProps extends ButtonProps, Children {
  /**
   * The mark to toggle
   */
  mark: ComposerMark
  /**
   * Whether the mark is disabled
   */
  disabled?: boolean
}

export interface ComposerFloatingToolbarProps extends DivProps, Children {}
