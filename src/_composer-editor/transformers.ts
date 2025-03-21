import { exists } from '../_utils/identity'

import type {
  ComposerText,
  KonpoBlockElement,
  KonpoComposedBody,
  KonpoLinkElement,
  KonpoText,
} from '../types'
import type { ComposerEditorDescendant, ComposerLinkElement } from './composer'

import {
  isKonpoParagraph,
  isKonpoText,
  isKonpoLink,
  isComposerLink,
  isComposerText,
  isComposerParagraph,
} from './guards'

export function toComposerEditorDescendants(
  body: KonpoComposedBody
): ComposerEditorDescendant[] {
  if (body.content.length <= 0) {
    return []
  }

  return body.content
    .map((block) => {
      // TODO: add bullet list
      if (!isKonpoParagraph(block)) {
        return null
      }

      const descendants = block.children
        .map((inline): ComposerText | ComposerLinkElement | null => {
          if (isKonpoText(inline)) {
            return { ...inline }
          }

          if (isKonpoLink(inline)) {
            return {
              type: 'link',
              url: inline.url,
              children: [{ text: inline.text }],
            }
          }

          return null
        })
        .filter(exists)

      return {
        ...block,
        descendants,
      }
    })
    .filter(exists)
}

export function toKonpoComposedBody(
  children: ComposerEditorDescendant[]
): KonpoComposedBody {
  if (children.length <= 0) {
    return { content: [] }
  }

  return {
    content: children
      .map((descendant) => {
        // TODO: add bullet list
        if (isComposerParagraph(descendant)) {
          return {
            type: 'paragraph',
            children: descendant.children
              .map((inline): KonpoText | KonpoLinkElement | null => {
                if (isComposerText(inline)) {
                  return { ...inline }
                }

                if (isComposerLink(inline)) {
                  return {
                    type: 'link',
                    url: inline.url,
                    text: inline.children[0]?.text ?? '',
                  }
                }

                return null
              })
              .filter(exists),
          }
        }

        return null
      })
      // TODO: temp type assertion until I add more block elements
      .filter(exists) as KonpoBlockElement[],
  }
}
