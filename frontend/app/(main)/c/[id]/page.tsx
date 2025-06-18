'use client';

import { useParams } from 'next/navigation';

import { useFetchConversationsById, useDeleteConversationById, useExitConversationById } from '@/hooks/use-conversations';

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

import { LogOut, Trash } from 'lucide-react';

import { format } from 'date-fns';

const ConversationPage = () => {
  const params = useParams<{ id: string }>();
  const { id } = params;

  const { data: conversation, isPending } = useFetchConversationsById(id);
  const { mutate: deleteConversation } = useDeleteConversationById(id);
  const { mutate: exitConversation } = useExitConversationById(id);

  const creator = conversation?.participants.find(p => p.role === 'creator')?.user;
  const createdText = `created by ${creator?.name} on ${format(conversation?.createdAt ?? 0, 'm/d/y')} at ${format(conversation?.createdAt ?? 0, 'h.mm a')}`;

  return (
    <div className="flex-1 flex flex-col">
      <Sheet>
        <SheetTrigger className="border flex flex-col items-baseline px-20 py-3 cursor-pointer">
          {isPending
            ? (
                <>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-80" />
                </>
              )
            : (
                <>
                  <h2 className="text-lg truncate">
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

            <Separator />

            <SheetDescription className="px-4 py-2">
              {createdText}
            </SheetDescription>

            <Separator className="bg-black/30 py-1" />

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

            <Separator className="bg-black/30 py-1" />

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

            <Separator className="bg-black/30 py-1" />
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex flex-col px-1 relative items-center align-middle">
        <MessageContainer
          conversationId={id}
          scrollOverlap={150}
        />
        <MessageInput
          conversationId={id}
          className="absolute bottom-3 left-1/2 transform -translate-x-1/2"
          maxTextareaHeight={400}
        />
      </div>
    </div>
  );
};

export default ConversationPage;
