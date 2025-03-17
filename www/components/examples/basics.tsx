'use client'

import {
  Composer,
  ComposerEditor,
  ComposerSubmitTrigger,
  ComposerFloatingToolbar,
} from '@/components/composer/composer'
import { Separator } from '@/components/ui/separator'

export function BasicExample1() {
  return (
    <Composer onSubmit={(body) => console.log(body)}>
      <ComposerEditor autoFocus placeholder='Write a message' />
      <ComposerFloatingToolbar>
        <div />
      </ComposerFloatingToolbar>
      <Separator />
      <div className='flex items-center justify-between'>
        <div />
        <ComposerSubmitTrigger>Send</ComposerSubmitTrigger>
      </div>
    </Composer>
  )
}
