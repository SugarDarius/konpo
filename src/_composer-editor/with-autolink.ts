import { isUrl } from '../_utils/string'
import type { ComposerEditor, ComposerLinkElement } from './composer'
import {
  SlateRange,
  SlateEditor,
  SlateTransforms,
  SlateElement,
} from './composer'

export function isComposerLinkActive(editor: ComposerEditor): boolean {
  const [link] = SlateEditor.nodes(editor, {
    match: (n) =>
      !SlateEditor.isEditor(n) &&
      SlateElement.isElement(n) &&
      n.type === 'link',
  })

  return !!link
}

const unwrapComposerLink = (editor: ComposerEditor) => {
  SlateTransforms.unwrapNodes(editor, {
    match: (n) =>
      !SlateEditor.isEditor(n) &&
      SlateElement.isElement(n) &&
      n.type === 'link',
  })
}

const wrapComposerLink = (
  editor: ComposerEditor,
  url: string,
  text?: string
): void => {
  if (isComposerLinkActive(editor)) {
    unwrapComposerLink(editor)
  }

  const selection = editor.selection
  const isCollapsed = selection && SlateRange.isCollapsed(selection)
  const link: ComposerLinkElement = {
    type: 'link',
    url,
    children: isCollapsed ? [{ text: text ?? url }] : [],
  }

  if (isCollapsed) {
    SlateTransforms.insertNodes(editor, link)
  } else {
    SlateTransforms.wrapNodes(editor, link, { split: true })
    SlateTransforms.collapse(editor, { edge: 'end' })
  }
}

export const withAutoLink = (editor: ComposerEditor): ComposerEditor => {
  const {
    isInline: baseIsInline,
    insertText: baseInsertText,
    insertData: baseInsertData,
    normalizeNode: baseNormalizeNode,
  } = editor

  editor.isInline = (element) => {
    return element.type === 'link' || baseIsInline(element)
  }

  editor.insertText = (text) => {
    if (
      text === ' ' &&
      editor.selection &&
      SlateRange.isCollapsed(editor.selection)
    ) {
      const [start] = SlateRange.edges(editor.selection)
      const beforeRange = SlateEditor.range(
        editor,
        { path: start.path, offset: 0 },
        start
      )
      const beforeText = SlateEditor.string(editor, beforeRange)
      const matches = beforeText.match(/(\S+)$/)

      if (matches && matches[1] && isUrl(matches[1])) {
        const url = matches[1]
        baseInsertText(text)

        SlateTransforms.move(editor, { distance: 1, reverse: true })
        SlateTransforms.select(editor, {
          anchor: { path: start.path, offset: start.offset - url.length },
          focus: { path: start.path, offset: start.offset },
        })

        wrapComposerLink(editor, url)
        SlateTransforms.move(editor)

        return
      }
    }

    baseInsertText(text)
  }

  editor.insertData = (data) => {
    const text = data.getData('text/plain')
    if (text && isUrl(text)) {
      wrapComposerLink(editor, text)
    } else {
      baseInsertData(data)
    }
  }

  editor.normalizeNode = ([node, path]) => {
    // Links cannot be nested nor empty
    if (SlateElement.isElement(node) && node.type === 'link') {
      if (
        node.children.length <= 0 ||
        (node.children.length === 1 && node.children[0]?.text === '')
      ) {
        SlateTransforms.removeNodes(editor, { at: path })
      }
    }

    baseNormalizeNode([node, path])
  }

  return editor
}
