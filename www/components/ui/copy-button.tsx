'use client'

import { Check, Copy } from 'lucide-react'
import { AnimatePresence, type Variants, motion } from 'motion/react'
import { useCallback, useRef, useState } from 'react'

import { cn } from '@/lib/utils'
import { useMounted } from '@/hooks/use-mounted'
import { Button } from '@/components/ui/button'

const COPY_ANIMATION_DURATION = 2000

const variants: Variants = {
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2 },
  },
  hidden: {
    opacity: 0,
    scale: 0.8,
    transition: { duration: 0.1 },
  },
}

function CopyButtonIcon({ isAnimating }: { isAnimating: boolean }) {
  return (
    <AnimatePresence mode='wait'>
      {isAnimating ? (
        <motion.div
          animate='visible'
          exit='hidden'
          initial='hidden'
          key='copied'
          variants={variants}
        >
          <Check className='size-3.5' />
        </motion.div>
      ) : (
        <motion.div
          animate='visible'
          exit='hidden'
          initial='hidden'
          key='copy'
          variants={variants}
        >
          <Copy className='size-3.5' />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function CopyButton({
  text,
  className,
  label = 'Copy code',
}: {
  text: string
  className?: string
  label?: string
}) {
  const timeout = useRef(0)
  const isMounted = useMounted()
  const [isAnimating, setIsAnimating] = useState(false)

  const copyToClipboard = useCallback(async (text: string) => {
    window.clearTimeout(timeout.current)

    try {
      await navigator.clipboard.writeText(text)
    } catch {}
  }, [])

  const handleCopy = useCallback(() => {
    copyToClipboard(text)
    setIsAnimating(true)

    setTimeout(() => {
      setIsAnimating(false)
    }, COPY_ANIMATION_DURATION)
  }, [copyToClipboard, text])

  return (
    <Button
      aria-label={label}
      className={cn(
        'hover:bg-secondary focus-visible:bg-secondary data-[state=open]:bg-secondary',
        className
      )}
      onClick={handleCopy}
      size='icon'
      title={label}
      variant='ghost'
    >
      {isMounted && <CopyButtonIcon isAnimating={isAnimating} />}
    </Button>
  )
}
