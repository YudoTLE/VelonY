'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

import { useFetchConversationsById, useDeleteConversationById, useExitConversationById } from '@/hooks/use-conversations';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageContainer } from '@/components/message-container';
import { MessageInput } from '@/components/message-input';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';

import { Copy, Check, LogOut, Trash } from 'lucide-react';

import { cn } from '@/lib/utils';

import { format } from 'date-fns';

const ConversationPage = () => {
  const params = useParams<{ id: string }>();
  const { id } = params;

  const { data: conversation, isPending } = useFetchConversationsById(id);
  const { mutate: deleteConversation } = useDeleteConversationById(id);
  const { mutate: exitConversation } = useExitConversationById(id);

  const [copiedInviteLink, setCopiedInviteLink] = useState(false);

  const handleInviteLinkCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopiedInviteLink(true);
      setTimeout(() => setCopiedInviteLink(false), 2000);
    }
    catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const creator = conversation?.participants.find(p => p.role === 'creator')?.user;
  const createdText = `created by ${creator?.name} on ${format(conversation?.createdAt ?? 0, 'm/d/y')} at ${format(conversation?.createdAt ?? 0, 'h.mm a')}`;
  const inviteLink = `${process.env.NEXT_PUBLIC_BASE_URL}/j/${id}`;

  return (
    <div className="flex-1 flex flex-col">
      <Sheet>
        <SheetTrigger className="border flex flex-col items-baseline px-20 py-3 cursor-pointer">
          {isPending
            ? (
                <>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-30" />
                </>
              )
            : (
                <>
                  <h2 className="text-lg text-left truncate min-w-0 w-full">
                    {conversation?.title}
                  </h2>
                  <p className="text-muted-foreground text-xs">
                    click here to see details
                  </p>
                </>
              )}
        </SheetTrigger>
        <SheetContent>
          <ScrollArea className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-center text-2xl">
                {conversation?.title}
              </SheetTitle>
            </SheetHeader>

            <SheetDescription className="px-4 py-2">
              {createdText}
            </SheetDescription>

            <Separator />

            <div className="px-4 py-2">
              <SheetDescription>
                invite link
              </SheetDescription>

              <div className="flex gap-2">
                <span className="text-blue-400">
                  {inviteLink}
                </span>
                <Button
                  onClick={handleInviteLinkCopy}
                  variant="ghost"
                  size="xs"
                  className="relative"
                >
                  <Copy className={cn(
                    'transition-all duration-200 ease-in-out',
                    copiedInviteLink ? 'scale-0 opacity-0' : 'scale-100 opacity-100',
                  )}
                  />
                  <div className={cn(
                    'absolute inset-0 flex items-center justify-center transition-all duration-200 ease-in-out',
                    copiedInviteLink ? 'scale-100 opacity-100' : 'scale-0 opacity-0',
                  )}
                  >
                    <Check />
                  </div>
                </Button>
              </div>
            </div>

            <Separator />

            <div>
              <SheetDescription className="px-4 py-2">
                {conversation?.participants.length}
                {' '}
                members
              </SheetDescription>
              {conversation?.participants.map((participant, index) => {
                return (
                  <div key={index} className="relative flex gap-3 px-4 py-2 hover:bg-secondary cursor-pointer">
                    <Avatar className="h-10 w-10 rounded-full">
                      <AvatarImage src={participant.user.avatar} alt={participant.user.name} />
                      <AvatarFallback className="bg-purple-600 rounded-full">AP</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{participant.user.name}</span>
                      <span className="truncate text-xs">{participant.user.email}</span>
                    </div>

                    <Badge
                      className="absolute top-2 right-2"
                      variant="outline"
                    >
                      {participant.role}
                    </Badge>
                  </div>
                );
              })}
            </div>

            <Separator />

            <div>
              {conversation?.isOwn === true
                && (
                  <button
                    onClick={() => deleteConversation()}
                    className="flex w-full gap-3 px-4 py-2 items-center text-red-400 hover:bg-secondary cursor-pointer"
                  >
                    <div className="flex items-center justify-center size-10">
                      <Trash size="20" />
                    </div>
                    <div className="grid flex-1 text-left leading-tight">
                      Delete Conversation
                    </div>
                  </button>
                )}
              {conversation?.isOwn === false
                && (
                  <button
                    onClick={() => exitConversation()}
                    className="flex w-full gap-3 px-4 py-2 items-center text-red-400 hover:bg-secondary cursor-pointer"
                  >
                    <div className="flex items-center justify-center size-10">
                      <LogOut size="20" />
                    </div>
                    <div className="grid flex-1 text-left leading-tight">
                      Exit Conversation
                    </div>
                  </button>
                )}
            </div>

            <Separator />
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex flex-col relative items-center align-middle">
        <MessageContainer
          conversationId={id}
          scrollOverlap={150}
        />
        <MessageInput
          conversationId={id}
          className="absolute bottom-0 sm:bottom-3 left-1/2 transform -translate-x-1/2"
          maxTextareaHeight={400}
        />
      </div>
    </div>
  );
};

export default ConversationPage;
