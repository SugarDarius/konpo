import type {
  ComposerText,
  KonpoBlockElement,
  KonpoBulletListElement,
  KonpoInlineElement,
  KonpoLinkElement,
  KonpoParagraphElement,
  KonpoText,
} from '../types'
import type {
  ComposerEditorDescendant,
  ComposerLinkElement,
  ComposerListItemElement,
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

export const isComposerListItem = (
  element: ComposerEditorDescendant
): element is ComposerListItemElement =>
  'type' in element && element.type === 'list-item'

export const isComposerBulletList = (
  element: ComposerEditorDescendant
): element is ComposerListItemElement =>
  'type' in element && element.type === 'bullet-list'

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

export const isKonpoBulletList = (
  element: KonpoBlockElement
): element is KonpoBulletListElement => element.type === 'bullet-list'
