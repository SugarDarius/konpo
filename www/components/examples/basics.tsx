'use client'

import {
  Composer,
  ComposerEditor,
  ComposerSubmitTrigger,
} from '@/components/composer/composer'
import { Separator } from '@/components/ui/separator'

export function BasicExample1() {
  return (
    <Composer onSubmit={(body) => console.log(body)}>
      <ComposerEditor autoFocus placeholder='Write a message' />
      <Separator />
      <div className='flex items-center justify-between'>
        <div />
        <ComposerSubmitTrigger>Send</ComposerSubmitTrigger>
      </div>
    </Composer>
  )
}
