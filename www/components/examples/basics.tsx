'use client'

import { Composer } from 'konpo'
import { Button } from '@/components/ui/button'

export function BasicExample1() {
  return (
    <Composer.Root
      className='relative w-[300px] h-[200px] border'
      onSubmit={(body) => {
        console.log('body', body)
      }}
    >
      <Composer.Editor
        className='h-full'
        autoFocus
        placeholder='Write a message'
      />
      <Composer.SubmitTrigger asChild>
        <Button>Send</Button>
      </Composer.SubmitTrigger>
    </Composer.Root>
  )
}
