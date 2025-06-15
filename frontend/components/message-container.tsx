import { useRef, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

import { useFetchMessages, useRealtimeSyncMessages, useLatestReceivedMessageTime } from '@/hooks/use-messages';

import { ScrollArea } from '@/components/ui/scroll-area';

import { MessageBubble, MessageBubbleAI } from '@/components/message-bubble';

import { LoaderCircle } from 'lucide-react';

import { cn } from '@/lib/utils';

export const MessageContainer = ({
  conversationId,
  scrollOverlap = 0,
  className,
  style,
}: {
  conversationId: string
  scrollOverlap: number
  className?: string
  style?: React.CSSProperties
}) => {
  const { data: messages, isPending, error } = useFetchMessages(conversationId);
  const latestReceived = useLatestReceivedMessageTime(conversationId);

  useRealtimeSyncMessages(conversationId);

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const getScrollElement = () => {
    if (!scrollAreaRef.current) return null;
    return scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
  };

  const virtualizer = useVirtualizer({
    count: messages?.length ?? 0,
    estimateSize: () => 100,
    getScrollElement,
    overscan: 7,
  });

  const virtualItems = virtualizer.getVirtualItems();

  const scrollToBottom = () => {
    if (!scrollAreaRef?.current) return;
    const viewport = getScrollElement();
    if (!viewport) return;

    const delta = viewport.scrollHeight - viewport.scrollTop;
    if (latestReceived?.isOwn || delta <= 800.0) {
      viewport.scrollTop = Math.max(viewport.scrollTop, viewport.scrollHeight);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [latestReceived]);

  if (error) {
    return (
      <div className="flex-1 flex text-muted-foreground">
        <p className="m-auto">{error.message || 'Unknown error occured'}</p>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="flex-1 flex text-muted-foreground">
        <LoaderCircle className="m-auto animate-spin" />
      </div>
    );
  }

  return (
    <ScrollArea
      ref={scrollAreaRef}
      className={cn(
        'flex flex-col flex-1 grow-1 basis-1 overflow-y-auto w-full',
        className,
      )}
      style={style}
      scrollBarProps={{
        style: { paddingBottom: `${scrollOverlap}px` },
      }}
    >
      <div className="flex flex-col mx-auto py-3 px-5 max-w-4xl">
        <div
          className="relative w-full"
          style={{
            height: `${virtualizer.getTotalSize()}px`,
          }}
        >
          <div
            className="absolute w-full flex flex-col gap-1"
            style={{
              paddingBottom: `${scrollOverlap}px`,
              transform: `translateY(${virtualItems[0]?.start ?? 0}px)`,
            }}
          >
            {virtualItems.map(({ index, key }) => {
              const message = messages[index];
              const prevMessage = messages[index - 1] || null;
              const nextMessage = messages[index + 1] || null;

              if (message.type === 'user') {
                return (
                  <div
                    key={key}
                    data-index={index}
                    ref={virtualizer.measureElement}
                  >
                    <MessageBubble
                      message={message}
                      prevMessage={prevMessage}
                      nextMessage={nextMessage}
                    />
                  </div>
                );
              }
              if (message.type === 'agent') {
                return (
                  <div
                    key={key}
                    data-index={index}
                    ref={virtualizer.measureElement}
                  >
                    <MessageBubbleAI
                      message={message}
                    />
                  </div>
                );
              }
            })}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};
