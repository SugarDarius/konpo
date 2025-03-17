import { Examples } from '@/components/examples/examples'

export default function Page() {
  return (
    <main className='flex flex-col w-full max-h-full h-full overflow-auto'>
      <div className='flex flex-col items-center justify-center w-full max-w-6xl h-auto p-4 mx-auto'>
        <Examples />
      </div>
    </main>
  )
}
