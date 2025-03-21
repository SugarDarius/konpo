import type {
  ComposerText,
  KonpoBlockElement,
  KonpoInlineElement,
  KonpoLinkElement,
  KonpoParagraphElement,
  KonpoText,
} from '../types'
import type {
  ComposerEditorDescendant,
  ComposerLinkElement,
  ComposerParagraphElement,
} from './composer'

export const isComposerText = (
  element: ComposerEditorDescendant
): element is ComposerText =>
  !('type' in element) && 'text' in element && typeof element.text === 'string'

export const isComposerLink = (
  element: ComposerEditorDescendant
): element is ComposerLinkElement =>
  'type' in element && element.type === 'link'

export const isComposerParagraph = (
  element: ComposerEditorDescendant
): element is ComposerParagraphElement =>
  'type' in element && element.type === 'paragraph'
// TODO: add guards for bullet list

export const isKonpoText = (inline: KonpoInlineElement): inline is KonpoText =>
  !('type' in inline) &&
  inline.text !== undefined &&
  typeof inline.text === 'string'

export const isKonpoLink = (
  inline: KonpoInlineElement
): inline is KonpoLinkElement => 'type' in inline && inline.type === 'link'

export const isKonpoParagraph = (
  element: KonpoBlockElement
): element is KonpoParagraphElement => element.type === 'paragraph'

// TODO: add guards for bullet
