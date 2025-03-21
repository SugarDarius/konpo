import type { ComposerEditor } from './composer'
import {
  SlateEditor,
  SlateElement,
  SlateNode,
  SlatePath,
  SlatePoint,
  SlateRange,
  SlateTransforms,
} from './composer'

export const withBulletList = (editor: ComposerEditor): ComposerEditor => {
  const {
    insertText: baseInsertText,
    insertBreak: baseInsertBreak,
    deleteBackward: baseDeleteBackward,
    normalizeNode: baseNormalizeNode,
  } = editor
  editor.insertText = (text) => {
    const selection = editor.selection

    // We only want to handle the space character for the dash+space pattern
    if (text === ' ' && selection && SlateRange.isCollapsed(selection)) {
      const anchor = selection.anchor
      // Get the block at the current selection
      const block = SlateEditor.above(editor, {
        match: (n) =>
          SlateElement.isElement(n) && SlateEditor.isBlock(editor, n),
        at: selection,
      })

      if (block) {
        const [blockElement, blockPath] = block
        // Skip if we're already in a list item
        if (
          SlateElement.isElement(blockElement) &&
          blockElement.type === 'list-item'
        ) {
          baseInsertText(text)
          return
        }

        // Get the start point of the current block
        const start = SlateEditor.start(editor, blockPath)
        // Check if we're at the beginning of the line + 1 character (the dash)
        const isAtStartPlusOne =
          anchor.path.every((val, i) => val === start.path[i]) &&
          anchor.offset === 1

        if (isAtStartPlusOne) {
          // Get the text of the current node
          const currentNodeText = SlateNode.string(blockElement)
          // Check if the first character is a dash
          if (currentNodeText.startsWith('-') && currentNodeText.length === 1) {
            // Delete the dash
            SlateTransforms.delete(editor, {
              at: { anchor: start, focus: anchor },
            })
            // Convert the current block to a list item
            SlateTransforms.setNodes(
              editor,
              { type: 'list-item' },
              { at: blockPath }
            )
            // Wrap in a bullet list
            SlateTransforms.wrapNodes(
              editor,
              { type: 'bullet-list', children: [] },
              { at: blockPath }
            )
            return
          }
        }
      }
    }

    baseInsertText(text)
  }
  editor.insertBreak = () => {
    const selection = editor.selection
    if (selection && SlateRange.isCollapsed(selection)) {
      // Check if we're in a list item
      const item = SlateEditor.above(editor, {
        match: (n) =>
          !SlateEditor.isEditor(n) &&
          SlateElement.isElement(n) &&
          n.type === 'list-item',
        at: selection,
      })
      if (item) {
        const [itemElement, itemPath] = item
        // Check if the list item is empty
        if (SlateNode.string(itemElement).length === 0) {
          // Get the parent list
          const [list, listPath] = SlateEditor.parent(editor, itemPath)
          // If it's the only item in the list, replace it with a paragraph (because it's empty)
          if (list.children.length === 1) {
            // 1️⃣ Transform the list item to a paragraph
            SlateTransforms.setNodes(
              editor,
              { type: 'paragraph' },
              { at: itemPath }
            )
            // 2️⃣ Unwrap the list
            SlateTransforms.unwrapNodes(editor, {
              at: listPath,
              match: (n) =>
                !SlateEditor.isEditor(n) &&
                SlateElement.isElement(n) &&
                n.type === 'bullet-list',
            })
          } else {
            // If it's not the only item, remove this empty item
            // and insert a paragraph after the list
            const isLastItem =
              itemPath[itemPath.length - 1] === list.children.length - 1
            // 1️⃣ Remove the empty list item
            SlateTransforms.removeNodes(editor, { at: itemPath })
            // 2️⃣ Insert a paragraph after the list
            const insertPath = isLastItem ? SlatePath.next(listPath) : listPath
            SlateTransforms.insertNodes(
              editor,
              { type: 'paragraph', children: [{ text: '' }] },
              {
                at: insertPath,
              }
            )
          }

          return
        }

        // For non-empty list items, insert a break and ensure the new node is a list item
        // First, split the node at the current selection
        SlateTransforms.splitNodes(editor, { always: true })

        // Then ensure the new node is a list item (it should already be at the right path)
        const newItemPath = SlatePath.next(itemPath)
        SlateTransforms.setNodes(
          editor,
          { type: 'list-item' },
          { at: newItemPath }
        )
        return
      }
    }

    baseInsertBreak()
  }
  editor.deleteBackward = (unit) => {
    const selection = editor.selection

    if (selection && SlateRange.isCollapsed(selection)) {
      // Check if we're in a list item
      const listItemEntry = SlateEditor.above(editor, {
        match: (n) =>
          !SlateEditor.isEditor(n) &&
          SlateElement.isElement(n) &&
          n.type === 'list-item',
        at: selection,
      })

      if (listItemEntry) {
        const [listItem, listItemPath] = listItemEntry
        const start = SlateEditor.start(editor, listItemPath)

        // Check if cursor is at the beginning of the list item AND the list item is empty
        if (
          SlatePoint.equals(selection.anchor, start) &&
          SlateNode.string(listItem).length === 0
        ) {
          // Temporarily disable normalization
          const savedNormalizeNode = editor.normalizeNode
          editor.normalizeNode = () => {}

          try {
            // Simply convert the list item to a paragraph
            SlateTransforms.setNodes(
              editor,
              { type: 'paragraph' },
              { at: listItemPath }
            )

            // Lift it out of the list
            SlateTransforms.liftNodes(editor, { at: listItemPath })
          } finally {
            // Restore normalization
            editor.normalizeNode = savedNormalizeNode
          }

          return
        }
      }
    }

    // Default behavior for all other cases
    baseDeleteBackward(unit)
  }

  editor.normalizeNode = ([node, path]) => {
    // Only normalize Elements, not Text nodes
    if (SlateElement.isElement(node)) {
      // Case 1: Ensure list items are always inside a bulleted-list
      if (node.type === 'list-item') {
        const parent = SlateEditor.parent(editor, path)
        const [parentNode] = parent

        if (
          !SlateElement.isElement(parentNode) ||
          (SlateElement.isElement(parentNode) &&
            parentNode.type !== 'bullet-list')
        ) {
          // Wrap the list item in a bulleted list
          SlateTransforms.wrapNodes(
            editor,
            { type: 'bullet-list', children: [] },
            { at: path }
          )
          return // Return early to avoid multiple normalizations at once
        }
      }

      // Case 2: Ensure bulleted-lists only contain list-items
      if (node.type === 'bullet-list') {
        // Check if the list has any children
        if (node.children.length === 0) {
          // Remove empty lists
          SlateTransforms.removeNodes(editor, { at: path })
          return
        }

        // Check each child of the list
        for (const [child, childPath] of SlateNode.children(editor, path)) {
          if (!SlateElement.isElement(child) || child.type !== 'list-item') {
            // Convert non-list-items to list-items
            SlateTransforms.setNodes(
              editor,
              { type: 'list-item' },
              { at: childPath }
            )
            return // Return early to avoid multiple normalizations at once
          }
        }

        // Case 3: Merge adjacent bulleted lists
        const next = SlateEditor.next(editor, { at: path })
        if (next) {
          const [nextNode, nextPath] = next

          if (
            SlateElement.isElement(nextNode) &&
            nextNode.type === 'bullet-list'
          ) {
            // Merge the two lists
            SlateTransforms.mergeNodes(editor, { at: nextPath })
            return
          }
        }
      }

      // Case 4: Handle invalid list items (empty ones that aren't being edited)
      if (node.type === 'list-item') {
        // Check if the list item has any content or is currently selected
        const isEmpty = SlateNode.string(node).length === 0
        const isSelected =
          editor.selection &&
          SlatePath.isDescendant(editor.selection.anchor.path, path)

        if (isEmpty && !isSelected) {
          // Find the parent list
          const [list, listPath] = SlateEditor.parent(editor, path)

          // If this is the only item in the list, remove the entire list
          if (list.children.length === 1) {
            SlateTransforms.removeNodes(editor, { at: listPath })
          } else {
            // Otherwise, just remove this empty item
            SlateTransforms.removeNodes(editor, { at: path })
          }
          return
        }
      }

      // Case 5: Handle nested list items
      if (node.type === 'list-item') {
        // Check if any children are list items
        for (const [child, childPath] of SlateNode.children(editor, path)) {
          if (SlateElement.isElement(child) && child.type === 'list-item') {
            // Lift the nested list item up to be a sibling
            SlateTransforms.liftNodes(editor, { at: childPath })
            return
          }
        }
      }
    }

    // Continue with the original normalization
    baseNormalizeNode([node, path])
  }

  return editor
}
