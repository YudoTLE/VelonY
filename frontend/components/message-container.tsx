import { useFetchMessages, useRealtimeSyncMessages, useLatestAddedMessage } from '@/hooks/use-messages'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useRef, useEffect } from 'react'
import { MessageBubble, MessageBubbleAI } from '@/components/message-bubble'
import { cn } from '@/lib/utils'
import { LoaderCircle } from 'lucide-react';

export const MessageContainer = ({
  conversationId,
  scrollOverlap = 0,
  className,
  style,
}: {
  conversationId: string,
  scrollOverlap: number,
  className?: string,
  style?: React.CSSProperties,
}) => {
  const { data: messages, isPending, error } = useFetchMessages(conversationId)
  const latestAddedMessage = useLatestAddedMessage(conversationId)

  useRealtimeSyncMessages(conversationId)

  const scrollAreaRef = useRef<HTMLDivElement>(null)
  
  const scrollToBottom = () => {
    if (!scrollAreaRef?.current) {
      return
    }

    const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLDivElement
    if (!viewport) {
      return
    }

    viewport.scrollTop = Math.max(viewport.scrollTop, viewport.scrollHeight)
  }

  useEffect(() => {
    scrollToBottom()
  }, [latestAddedMessage])

  if (error) {
    return (
      <div className='flex-1 flex text-muted-foreground'>
        <p className='m-auto'>{error.message || 'Unknown error occured'}</p>
      </div>
    )
  }
  
  if (isPending) {
    return (
      <div className='flex-1 flex text-muted-foreground'>
        <LoaderCircle className='m-auto animate-spin' />
      </div>
    )
  }

  return (
    <ScrollArea
      ref={scrollAreaRef}
      className={cn(
        'flex flex-col flex-1 grow-1 basis-1 overflow-y-auto w-full',
        className
      )}
      style={style}
      scrollBarProps={{
        style: { paddingBottom: `${scrollOverlap}px` }
      }}
    >
      <div className='flex flex-col mx-auto py-3 px-5 max-w-4xl'>
        <div
          className='flex flex-col gap-1'
          style={{ paddingBottom: `${scrollOverlap}px` }}
        >
          {messages.list.map((message, index) => {
            const prevMessage = messages.list[index - 1] || null
            const nextMessage = messages.list[index + 1] || null

            if (message.type === 'user') {
              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  prevMessage={prevMessage}
                  nextMessage={nextMessage}
                />
              )
            }
            if (message.type === 'agent') {
              return (
                <MessageBubbleAI
                  key={message.id}
                  message={message}
                />
              )
            }
          })}
        </div>
      </div>
    </ScrollArea>
  )
}