import { useDeleteMessage } from '@/hooks/use-messages';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeBlock from '@/components/code-block';
import MermaidChart from '@/components/mermaid-chart';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

import { cn } from '@/lib/utils';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';

import {
  Copy,
  Trash,
  Check,
  Clock,
  EllipsisVertical,
  Pencil,
} from 'lucide-react';

import { format } from 'date-fns';

const MessageBubbleComponent = (
  { prevMessage, nextMessage, message }: { prevMessage?: Message, nextMessage?: Message, message: Message },
) => {
  const { mutate: deleteMutation } = useDeleteMessage(message.conversationId);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
  };
  const handleDelete = () => {
    deleteMutation(message.id);
  };

  const isSameSenderAsPrev = (!!message.senderId && message.senderId === prevMessage?.senderId) || (message.isOwn && (message.isOwn === prevMessage?.isOwn));
  const isSameSenderAsNext = (!!message.senderId && message.senderId === nextMessage?.senderId) || (message.isOwn && (message.isOwn === nextMessage?.isOwn));
  const mergeWithPrev = isSameSenderAsPrev && prevMessage?.type === 'user';
  const mergeWithNext = isSameSenderAsNext && nextMessage?.type === 'user';

  return (
    <div className={cn(
      'flex group gap-1 sm:gap-2',
      message.isOwn ? 'ml-auto flex-row-reverse' : 'mr-auto',
      message.status === 'deleting' && 'opacity-50',
    )}
    >
      {!mergeWithPrev
        ? (
            <Avatar className={cn('h-8 w-8 rounded-full mt-4', message.isOwn && 'hidden sm:block')}>
              <AvatarImage src={message.senderAvatar} alt={message.senderName} />
              <AvatarFallback className="rounded-lg bg-purple-500 cursor-default">{message.initial}</AvatarFallback>
            </Avatar>
          )
        : <div className={cn('w-8 min-w-8', message.isOwn && 'hidden sm:block')} />}
      <div className={cn(
        'grid gap-x-2 max-w-2xl',
        message.isOwn ? 'grid-cols-[auto_1fr]' : 'grid-cols-[1fr_auto]',
      )}
      >
        {!mergeWithPrev
          && (
            <span className={cn(
              'row-start-1 text-muted-foreground text-xs px-1 mt-2',
              message.isOwn ? 'col-start-2 text-right' : 'col-start-1',
            )}
            >
              {message.senderName}
            </span>
          )}

        <Card className={cn(
          'row-start-2 max-w-3xl pt-1 pb-0.5 rounded-2xl border-none',
          message.isOwn ? 'col-start-2 bg-primary rounded-tr-xs' : 'col-start-1 bg-secondary rounded-tl-xs',
          mergeWithNext
          && (message.isOwn ? 'bg-primary rounded-br-xs' : 'bg-secondary rounded-bl-xs'),
        )}
        >
          <CardContent className="px-3 flex flex-col">
            <div className="overflow-hidden max-w-none">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="whitespace-pre-wrap break-words">{children}</p>,
                  // pre: ({ children }) => <pre className='overflow-x-auto'>{children}</pre>
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
            {message.isOwn
              ? (
                  <span className="ml-auto flex items-center gap-1">
                    <p className="text-[10px]">
                      {format(message.createdAt, 'h.mm a')}
                    </p>
                    {message.status !== 'sending'
                      ? <Check size={12} className="-mr-1.5" />
                      : <Clock size={12} className="-mr-1.5" />}
                  </span>
                )
              : (
                  <span className="mr-auto flex items-center gap-1">
                    <p className="text-[10px]">
                      {format(message.createdAt, 'h.mm a')}
                    </p>
                  </span>
                )}
          </CardContent>
        </Card>

        <div className={cn(
          'row-start-2 text-muted-foreground pt-1',
          message.isOwn ? 'right-full' : 'left-full',
        )}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="opacity-80 sm:opacity-0 group-hover:opacity-80"
              >
                <EllipsisVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={message.isOwn ? 'start' : 'end'}>
              <DropdownMenuItem onClick={handleCopy}>
                Copy
                <DropdownMenuShortcut>
                  <Copy />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopy}>
                Edit
                <DropdownMenuShortcut>
                  <Pencil />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} variant="destructive">
                Delete
                <DropdownMenuShortcut>
                  <Trash />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

const MessageBubbleAIComponent = (
  { message }: { message: Message },
) => {
  const { mutate: deleteMutation } = useDeleteMessage(message.conversationId);
  const [copiedContent, setCopiedContent] = useState(false);
  const [copiedExtra, setCopiedExtra] = useState(false);

  const handleCopyExtra = async () => {
    try {
      await navigator.clipboard.writeText(message.extra);
      setCopiedExtra(true);
      setTimeout(() => setCopiedExtra(false), 2000);
    }
    catch (error) {
      console.error('Failed to copy:', error);
    }
  };
  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedContent(true);
      setTimeout(() => setCopiedContent(false), 2000);
    }
    catch (error) {
      console.error('Failed to copy:', error);
    }
  };
  const handleDelete = () => {
    deleteMutation(message.id);
  };

  const hasReasoning = message.extra.trim().length > 0;

  return (
    <div className={cn(
      'flex group gap-2',
      message.status === 'deleting' && 'opacity-50',
    )}
    >
      <Avatar className="h-8 w-8 rounded-full mt-4 mr-1">
        <AvatarFallback className="rounded-lg bg-purple-500 cursor-default">{message.initial}</AvatarFallback>
      </Avatar>
      <div className="w-full min-w-0">
        <div className="text-muted-foreground text-xs mt-2">
          {message.agentName}
          {' '}
          —
          {' '}
          {message.modelName}
        </div>
        {hasReasoning
          && (
            <ScrollArea className="relative overflow-hidden grow-1 basis-1 max-h-30 flex flex-col flex-1 max-w-none prose prose-invert text-xs p-1 mb-2">
              <div className="pointer-events-none absolute -top-1 left-0 right-0 h-6 bg-gradient-to-b from-background to-transparent z-10" />
              <div className="pointer-events-none absolute -bottom-1 left-0 right-0 h-6 bg-gradient-to-t from-background to-transparent z-10" />

              <Button
                onClick={handleCopyExtra}
                variant="ghost"
                size="xs"
                className="absolute right-2.5 top-0  text-blue-400 z-20 bg-zinc-900/50 backdrop-blur-2xl border border-white/10"
              >
                <Copy className={cn(
                  'transition-all duration-200 ease-in-out',
                  copiedExtra ? 'scale-0 opacity-0' : 'scale-100 opacity-100',
                )}
                />
                <div className={cn(
                  'absolute inset-0 flex items-center justify-center transition-all duration-200 ease-in-out',
                  copiedExtra ? 'scale-100 opacity-100' : 'scale-0 opacity-0',
                )}
                >
                  <Check />
                </div>
              </Button>

              <div className="absolute bottom-0 right-2.5 text-blue-400 z-20 bg-zinc-900/50 backdrop-blur-2xl px-2 py-1 rounded border border-white/10 cursor-default">
                Reasoning
              </div>

              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="whitespace-pre-wrap break-words">{children}</p>,
                  pre: ({ children }) => <pre className="overflow-x-auto">{children}</pre>,
                }}
              >
                {message.extra}
              </ReactMarkdown>
            </ScrollArea>
          )}

        <div className="overflow-hidden max-w-none prose prose-invert text-white">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => <p className="whitespace-pre-wrap break-words">{children}</p>,
              pre: ({ children, className, ...props }) => {
                return (
                  <pre className={cn(className, 'p-0 m-0 bg-transparent overflow-y-hidden')} {...props}>
                    {children}
                  </pre>
                );
              },
              code: ({ className, children, ...props }) => {
                const match = /language-(\w+)/.exec(className || '');
                const language = match ? match[1] : '';
                const code = String(children).replace(/\n$/, '');

                if (message.status !== 'sending') {
                  if (language === 'mermaid') {
                    return <MermaidChart chart={code} />;
                  }
                }
                if (language) {
                  return <CodeBlock code={code} language={language} />;
                }

                return <code {...props}>{code}</code>;
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
        <div>
          <p className="text-[10px]">
            {format(message.createdAt, 'h.mm a')}
          </p>
        </div>
        <div className="opacity-60 sm:opacity-30 relative group-hover:opacity-60">
          <Button
            onClick={handleCopyContent}
            variant="ghost"
            size="sm"
          >
            <Copy className={cn(
              'transition-all duration-200 ease-in-out',
              copiedContent ? 'scale-0 opacity-0' : 'scale-100 opacity-100',
            )}
            />
            <div className={cn(
              'absolute inset-0 flex items-center justify-center transition-all duration-200 ease-in-out',
              copiedContent ? 'scale-100 opacity-100' : 'scale-0 opacity-0',
            )}
            >
              <Check />
            </div>
          </Button>
          <Button
            onClick={handleDelete}
            variant="ghost"
            size="sm"
          >
            <Trash />
          </Button>
        </div>
      </div>
      <div className="w-10 hidden sm:block" />
    </div>
  );
};

MessageBubbleComponent.displayName = 'MessageBubble';
MessageBubbleAIComponent.displayName = 'MessageBubbleAI';

export const MessageBubble = React.memo(MessageBubbleComponent);
export const MessageBubbleAI = React.memo(MessageBubbleAIComponent);
