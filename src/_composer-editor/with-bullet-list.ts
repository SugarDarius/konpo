import type { ComposerEditor } from './composer'
import {
  Editor as SlateEditor,
  Element as SlateElement,
  Node as SlateNode,
  Path as SlatePath,
  Point as SlatePoint,
  Range as SlateRange,
  Transforms as SlateTransforms,
} from 'slate'

export const withBulletList = (editor: ComposerEditor): ComposerEditor => {
  const {
    insertText: baseInsertText,
    insertBreak: baseInsertBreak,
    deleteBackward: baseDeleteBackward,
    normalizeNode: baseNormalizeNode,
  } = editor

  /**
   * 1) InsertText override
   *
   *    - Converts "- " at the start of a block into a bullet list item.
   *    - Skips if the current block is already a list item.
   */
  editor.insertText = (text) => {
    const { selection } = editor

    if (text === ' ' && selection && SlateRange.isCollapsed(selection)) {
      // We only trigger on exactly one space.
      const anchor = selection.anchor
      // Get the current block above the selection.
      const blockEntry = SlateEditor.above(editor, {
        match: (n) =>
          SlateElement.isElement(n) && SlateEditor.isBlock(editor, n),
        at: selection,
      })

      if (blockEntry) {
        const [blockElement, blockPath] = blockEntry

        // If we're already in a bullet-list item, do nothing special.
        if (
          SlateElement.isElement(blockElement) &&
          blockElement.type === 'list-item'
        ) {
          baseInsertText(text)
          return
        }

        // Where does the block start?
        const blockStart = SlateEditor.start(editor, blockPath)
        // Are we exactly at offset=1 from the beginning (i.e. after a single character)?
        const isAtStartPlusOne =
          SlatePath.equals(anchor.path, blockStart.path) && anchor.offset === 1

        if (isAtStartPlusOne) {
          // Get the text of the current block
          const currentText = SlateNode.string(blockElement)
          // If the block is exactly "-" so far, convert it into a bullet list with a single list-item.
          if (currentText === '-') {
            // Delete the dash
            SlateTransforms.delete(editor, {
              at: { anchor: blockStart, focus: anchor },
            })
            // Make this block a list item
            SlateTransforms.setNodes(
              editor,
              { type: 'list-item' },
              { at: blockPath }
            )
            // Wrap the new list item with a bullet-list
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

  /**
   * 2) InsertBreak override
   *
   *    - If ENTER is pressed in an empty list item, unwrap or remove the list item.
   *    - Otherwise, split the list item, and ensure the new block is also a list item.
   */
  editor.insertBreak = () => {
    const { selection } = editor

    if (selection && SlateRange.isCollapsed(selection)) {
      const listItemEntry = SlateEditor.above(editor, {
        match: (n) => SlateElement.isElement(n) && n.type === 'list-item',
        at: selection,
      })

      if (listItemEntry) {
        const [listItem, listItemPath] = listItemEntry
        const listItemText = SlateNode.string(listItem)

        // If the list item is empty, handle unwrapping or removing it:
        if (listItemText.length === 0) {
          const parentListEntry = SlateEditor.parent(editor, listItemPath)
          const [parentList, parentListPath] = parentListEntry

          // If this is the only item in the list, turn it into a paragraph and unwrap
          if (parentList.children.length === 1) {
            SlateTransforms.setNodes(
              editor,
              { type: 'paragraph' },
              { at: listItemPath }
            )
            SlateTransforms.unwrapNodes(editor, {
              at: parentListPath,
              match: (n) =>
                SlateElement.isElement(n) && n.type === 'bullet-list',
            })
          } else {
            // If not the only item, remove the empty list item and insert a paragraph after this list
            const isLastItem =
              listItemPath[listItemPath.length - 1] ===
              parentList.children.length - 1

            // Remove empty list item
            SlateTransforms.removeNodes(editor, { at: listItemPath })

            // Insert paragraph after the list if this was the last item,
            // otherwise insert at the list path for a "break" effect
            const insertPath = isLastItem
              ? SlatePath.next(parentListPath)
              : parentListPath
            SlateTransforms.insertNodes(
              editor,
              { type: 'paragraph', children: [{ text: '' }] },
              { at: insertPath }
            )
          }
          return
        }

        // Non-empty list item: split the list item and ensure the new block is also a list item
        SlateTransforms.splitNodes(editor, { always: true })
        const newItemPath = SlatePath.next(listItemPath)
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

  /**
   * 3) DeleteBackward override
   *
   *    - If backspace at the start of an empty list item, turn it into a paragraph and lift it out of the list.
   */
  editor.deleteBackward = (unit) => {
    const { selection } = editor

    if (selection && SlateRange.isCollapsed(selection)) {
      const listItemEntry = SlateEditor.above(editor, {
        match: (n) => SlateElement.isElement(n) && n.type === 'list-item',
        at: selection,
      })

      if (listItemEntry) {
        const [listItem, listItemPath] = listItemEntry
        const listItemStart = SlateEditor.start(editor, listItemPath)
        const isEmptyListItem = SlateNode.string(listItem).length === 0
        const isCursorAtStart = SlatePoint.equals(
          selection.anchor,
          listItemStart
        )

        // If the list item is empty and the cursor is at the start, convert to a paragraph
        if (isCursorAtStart && isEmptyListItem) {
          const saveNormalize = editor.normalizeNode
          editor.normalizeNode = () => {}

          try {
            SlateTransforms.setNodes(
              editor,
              { type: 'paragraph' },
              { at: listItemPath }
            )
            SlateTransforms.liftNodes(editor, { at: listItemPath })
          } finally {
            editor.normalizeNode = saveNormalize
          }
          return
        }
      }
    }

    baseDeleteBackward(unit)
  }

  /**
   * 4) normalizeNode override
   *
   *    - Ensure all 'list-item' types are wrapped in 'bullet-list'.
   *    - Ensure 'bullet-list' only contains 'list-item' elements.
   *    - Merge adjacent bullet-lists.
   *    - Remove or unwrap invalid or empty list-items.
   *    - Prevent nested list items from living directly inside other list items.
   *
   *    This ensures the editor’s structure remains valid.
   */
  editor.normalizeNode = ([node, path]) => {
    if (SlateElement.isElement(node)) {
      // Ensure list items are wrapped in a bullet-list
      if (node.type === 'list-item') {
        const parentEntry = SlateEditor.parent(editor, path)
        const [parentNode] = parentEntry

        if (
          !SlateElement.isElement(parentNode) ||
          parentNode.type !== 'bullet-list'
        ) {
          SlateTransforms.wrapNodes(
            editor,
            { type: 'bullet-list', children: [] },
            { at: path }
          )
          return
        }
      }

      // Ensure that bullet-lists only contain list-items
      if (node.type === 'bullet-list') {
        if (node.children.length === 0) {
          // Remove empty bullet-list
          SlateTransforms.removeNodes(editor, { at: path })
          return
        }

        // Force all children to be 'list-item'
        for (const [child, childPath] of SlateNode.children(editor, path)) {
          if (!SlateElement.isElement(child) || child.type !== 'list-item') {
            SlateTransforms.setNodes(
              editor,
              { type: 'list-item' },
              { at: childPath }
            )
            return
          }
        }

        // Merge adjacent bullet-lists
        const nextEntry = SlateEditor.next(editor, { at: path })
        if (nextEntry) {
          const [nextNode, nextPath] = nextEntry
          if (
            SlateElement.isElement(nextNode) &&
            nextNode.type === 'bullet-list'
          ) {
            SlateTransforms.mergeNodes(editor, { at: nextPath })
            return
          }
        }
      }

      // Remove empty, unselected list-items (avoid leaving in the doc)
      if (node.type === 'list-item') {
        const isEmpty = SlateNode.string(node).length === 0
        const isSelected =
          editor.selection &&
          SlateRange.isCollapsed(editor.selection) &&
          SlatePath.isAncestor(path, editor.selection.anchor.path)

        if (isEmpty && !isSelected) {
          const [parentList, parentListPath] = SlateEditor.parent(editor, path)
          // If it's the only item, remove the entire bullet-list
          if (parentList.children.length === 1) {
            SlateTransforms.removeNodes(editor, { at: parentListPath })
          } else {
            // Otherwise, remove just this empty item
            SlateTransforms.removeNodes(editor, { at: path })
          }
          return
        }

        // Lift nested list items
        for (const [child, childPath] of SlateNode.children(editor, path)) {
          if (SlateElement.isElement(child) && child.type === 'list-item') {
            SlateTransforms.liftNodes(editor, { at: childPath })
            return
          }
        }
      }
    }

    // Continue with default normalization
    baseNormalizeNode([node, path])
  }

  return editor
}
