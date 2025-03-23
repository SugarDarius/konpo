import { exists } from '../_utils/identity'

import type {
  ComposerText,
  KonpoBlockElement,
  KonpoComposedBody,
  KonpoInlineElement,
  KonpoLinkElement,
  KonpoListItemElement,
  KonpoText,
} from '../types'
import type {
  ComposerEditorDescendant,
  ComposerInlineElement,
  ComposerLinkElement,
  ComposerListItemElement,
} from './composer'

import {
  isKonpoParagraph,
  isKonpoText,
  isKonpoLink,
  isComposerLink,
  isComposerText,
  isComposerParagraph,
  isComposerBulletList,
  isComposerListItem,
  isKonpoBulletList,
} from './guards'

export function toComposerEditorDescendants(
  body: KonpoComposedBody
): ComposerEditorDescendant[] {
  if (body.content.length <= 0) {
    return []
  }

  const buildInlines = (
    inline: KonpoInlineElement
  ): ComposerText | ComposerLinkElement | null => {
    if (isKonpoText(inline)) {
      return {
        text: inline.text,
        bold: inline.bold,
        italic: inline.italic,
        strikethrough: inline.strikethrough,
        code: inline.code,
      }
    }

    if (isKonpoLink(inline)) {
      return {
        type: 'link',
        url: inline.url,
        children: [{ text: inline.text }],
      }
    }

    return null
  }

  return body.content
    .map((block: KonpoBlockElement): ComposerEditorDescendant | null => {
      if (isKonpoParagraph(block)) {
        return {
          type: 'paragraph',
          children: block.children.map(buildInlines).filter(exists),
        }
      }

      if (isKonpoBulletList(block)) {
        return {
          type: 'bullet-list',
          children: block.children.map((listItem): ComposerListItemElement => {
            return {
              type: 'list-item',
              children: listItem.children.map(buildInlines).filter(exists),
            }
          }),
        }
      }

      return null
    })
    .filter(exists)
}

export function toKonpoComposedBody(
  children: ComposerEditorDescendant[]
): KonpoComposedBody {
  if (children.length <= 0) {
    return { content: [] }
  }

  const buildInlines = (
    inline: ComposerInlineElement
  ): KonpoText | KonpoLinkElement | null => {
    if (isComposerText(inline)) {
      return {
        text: inline.text,
        bold: inline.bold,
        italic: inline.italic,
        strikethrough: inline.strikethrough,
        code: inline.code,
      }
    }

    if (isComposerLink(inline)) {
      return {
        type: 'link',
        url: inline.url,
        text: inline.children[0]?.text ?? '',
      }
    }

    return null
  }

  return {
    content: children
      .map((descendant: ComposerEditorDescendant): KonpoBlockElement | null => {
        if (isComposerParagraph(descendant)) {
          return {
            type: 'paragraph',
            children: descendant.children.map(buildInlines).filter(exists),
          }
        }

        if (isComposerBulletList(descendant)) {
          return {
            type: 'bullet-list',
            children: descendant.children
              .map((listItem): KonpoListItemElement | null => {
                if (isComposerListItem(listItem)) {
                  return {
                    type: 'list-item',
                    children: listItem.children
                      .map(buildInlines)
                      .filter(exists),
                  }
                }

                return null
              })
              .filter(exists),
          }
        }

        return null
      })
      .filter(exists),
  }
}
