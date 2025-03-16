'use client'
import { Composer } from 'konpo'

export default function Home() {
  return (
    <div className='grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]'>
      <main className='flex flex-col gap-[32px] row-start-2 items-center sm:items-start'>
        <Composer.Root
          className='relative w-[300px] h-[200px] border'
          onSubmit={(body) => {
            console.log('body', body)
          }}
        >
          <Composer.Editor className='h-full' autoFocus />
          <Composer.SubmitButton>Send</Composer.SubmitButton>
        </Composer.Root>
      </main>
    </div>
  )
}
