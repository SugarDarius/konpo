'use client'

import { Bold, Italic, Code, Strikethrough } from 'lucide-react'

import {
  Composer,
  ComposerEditor,
  ComposerSubmitTrigger,
  ComposerFloatingToolbar,
  ComposerToggleMarkTrigger,
} from '@/components/ui/composer'
import { Separator } from '@/components/ui/separator'

export function BasicExample1() {
  return (
    <Composer onSubmit={(body) => console.log(body)}>
      <ComposerEditor autoFocus placeholder='Write a message' />
      <ComposerFloatingToolbar>
        <ComposerToggleMarkTrigger mark='bold'>
          <Bold className='size-4' />
        </ComposerToggleMarkTrigger>
        <ComposerToggleMarkTrigger mark='italic'>
          <Italic className='size-4' />
        </ComposerToggleMarkTrigger>
        <ComposerToggleMarkTrigger mark='strikethrough'>
          <Strikethrough className='size-4' />
        </ComposerToggleMarkTrigger>
        <ComposerToggleMarkTrigger mark='code'>
          <Code className='size-4' />
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
