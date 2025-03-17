import { CodeBlock } from '@/components/ui/code-block'
import { BasicExample1 } from './basics'

export function Examples() {
  return (
    <div className='flex flex-col gap-2 w-full max-w-[480px] items-center'>
      <BasicExample1 />
      <CodeBlock lang='bash'>npm i konpo</CodeBlock>
      <CodeBlock lang='tsx'>{`
        import { Composer } from 'konpo'

        export function CommentComposer() {
          return (
            <Composer.Root>
              <Composer.Editor />
              <Composer.FloatingToolbar>
                <Composer.ToggleMarkTrigger>
                  <BoldIcon />
                </Composer.ToggleMarkTrigger>
              </Composer.FloatingToolbar>
              <Composer.SubmitTrigger />
            </Composer.Root>
          )
        }
      `}</CodeBlock>
    </div>
  )
}
