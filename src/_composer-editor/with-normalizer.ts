import type { ComposerEditor } from './composer'
import { SlateElement, SlateNode, SlateTransforms } from './composer'

export const withNormalizer = (editor: ComposerEditor): ComposerEditor => {
  const { normalizeNode: baseNormalizeNode } = editor

  editor.normalizeNode = ([node, path]): void => {
    // Paragraphs must always contain only inline elements
    if (SlateElement.isElement(node) && node.type === 'paragraph') {
      for (const [child, childPath] of SlateNode.children(editor, path)) {
        if (SlateElement.isElement(child) && !editor.isInline(child)) {
          SlateTransforms.unwrapNodes(editor, { at: childPath })
          return
        }
      }
    }

    baseNormalizeNode([node, path])
  }

  return editor
}
