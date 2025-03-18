import { CodeBlock } from '@/components/ui/code-block'
import { BasicExample1 } from './basics'

export function Examples() {
  return (
    <div className='flex flex-col gap-2 w-full max-w-[480px] items-center'>
      <BasicExample1 />
      <CodeBlock lang='bash'>npm i konpo</CodeBlock>
      <CodeBlock lang='tsx'>{`
        import { Composer } from 'konpo'

        export function ComposableComposer() {
          return (
            <Composer.Root>
              <Composer.Editor 
                autoFocus
                placeholder='Write a message'
                components={{
                  Link: Composer.Link
                }}
              />
              <Composer.FloatingToolbar>
                <Composer.ToggleMarkTrigger>
                  <BoldIcon />
                </Composer.ToggleMarkTrigger>
              </Composer.FloatingToolbar>
              <Composer.SubmitTrigger>
                Send
              </Composer.SubmitTrigger>
            </Composer.Root>
          )
        }
      `}</CodeBlock>
    </div>
  )
}
