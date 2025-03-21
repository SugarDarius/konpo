import { withHistory } from 'slate-history'
import { withReact } from 'slate-react'

import type { ComposerEditor } from './composer'
import { createSlateEditor } from './composer'
import { withPrimeMarks } from './marks'
import { withNormalizer } from './with-normalizer'
import { withBulletList } from './with-bullet-list'
import { withMarkdownMarksShortcuts } from './with-markdown-marks-shortcut'
import { withAutoLink } from './with-autolink'

export function createComposerEditor({
  useBulletList = true,
  useMarkdownMarksShortcuts = true,
}: {
  useBulletList: boolean
  useMarkdownMarksShortcuts: boolean
}): ComposerEditor {
  const base = withPrimeMarks(
    withHistory(withReact(createSlateEditor() as ComposerEditor))
  )

  let compound = base
  if (useBulletList) {
    compound = withBulletList(compound)
  }

  if (useMarkdownMarksShortcuts) {
    compound = withMarkdownMarksShortcuts(compound)
  }

  return withNormalizer(withAutoLink(compound))
}
