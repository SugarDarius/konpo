'use client'

import { Bold } from 'lucide-react'

import {
  Composer,
  ComposerEditor,
  ComposerSubmitTrigger,
  ComposerFloatingToolbar,
  ComposerToggleMarkTrigger,
} from '@/components/composer/composer'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'

export function BasicExample1() {
  return (
    <Composer onSubmit={(body) => console.log(body)}>
      <ComposerEditor autoFocus placeholder='Write a message' />
      <ComposerFloatingToolbar>
        <ComposerToggleMarkTrigger mark='bold'>
          <Button size='icon'>
            <Bold className='size-4' />
          </Button>
        </ComposerToggleMarkTrigger>
      </ComposerFloatingToolbar>
      <Separator />
      <div className='flex items-center justify-between'>
        <div />
        <ComposerSubmitTrigger>Send</ComposerSubmitTrigger>
      </div>
    </Composer>
  )
}
