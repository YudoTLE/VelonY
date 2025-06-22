'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useFetchAgentById, useToggleAgentSubscriptionById } from '@/hooks/use-agents';

import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

import {
  Bot,
  LoaderCircle,
} from 'lucide-react';

import ReactMarkdown from 'react-markdown';

const ViewAgentPage = () => {
  const params = useParams<{ id: string }>();
  const { id } = params;

  const { data: agent, error: fetchError, isPending: isFetchPending } = useFetchAgentById(id);
  const { mutate, isPending: isTogglePending } = useToggleAgentSubscriptionById(id);

  if (fetchError) {
    return (
      <div className="flex-1 flex text-muted-foreground">
        <p className="m-auto">{fetchError.message || 'Unknown error occurred'}</p>
      </div>
    );
  }

  if (isFetchPending) {
    return (
      <div className="flex-1 flex text-muted-foreground">
        <LoaderCircle className="m-auto animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-12 overflow-clip overscroll-y-auto w-full">
      <Card className="relative size-fit sm:px-4 max-w-2xl w-full bg-card/80">
        <div className="absolute -top-6 -left-6 size-32 bg-emerald-400 rounded-full -z-10 blur-xl opacity-25" />
        <div className="absolute -top-12 -left-12 size-64 bg-green-500 rounded-full -z-10 blur-2xl opacity-20" />
        <div className="absolute -top-20 -left-20 size-128 bg-teal-500 rounded-full -z-10 blur-3xl opacity-15" />
        <div className="absolute -bottom-6 -right-6 size-32 bg-violet-400 rounded-full -z-10 blur-xl opacity-25" />
        <div className="absolute -bottom-12 -right-12 size-64 bg-purple-500 rounded-full -z-10 blur-2xl opacity-20" />
        <div className="absolute -bottom-20 -right-20 size-128 bg-indigo-600 rounded-full -z-10 blur-3xl opacity-15" />

        {agent?.isOwn
          && (
            <Button
              asChild
              variant="link"
              className="absolute top-0 right-0 text-blue-400 font-normal"
            >
              <Link href={`${agent?.url}/edit`}>
                edit
              </Link>
            </Button>
          )}

        <CardHeader className="flex">
          {agent?.visibility === 'default'
            ? (
                <Avatar className="size-15 mr-2 sm:mr-4 rounded-full">
                  <AvatarFallback className="rounded-lg bg-gradient-to-br from-emerald-600 to-purple-600 cursor-default">
                    <Bot size="30" className="text-white" />
                  </AvatarFallback>
                </Avatar>
              )
            : (
                <Avatar className="size-24 mr-4 sm:mr-8 rounded-full">
                  <AvatarFallback className="rounded-lg bg-gradient-to-br from-emerald-600 to-purple-600 cursor-default">
                    <Bot size="48" className="text-white" />
                  </AvatarFallback>
                </Avatar>
              )}
          <div>
            <div className="text-2xl font-bold">
              {agent?.name}
            </div>
            <div>
              {agent?.visibility === 'private'
                && (
                  <Badge className="bg-secondary cursor-default border-border">
                    <span className="bg-gray-500 rounded-full aspect-square h-2 w-2" />
                    private
                  </Badge>
                )}
              {agent?.visibility === 'public'
                && (
                  <Badge className="bg-secondary cursor-default border-border">
                    <span className="bg-green-400 rounded-full aspect-square h-2 w-2" />
                    public
                  </Badge>
                )}
              {agent?.visibility === 'default'
                && (
                  <Badge className="bg-secondary cursor-default border-border">
                    <span className="bg-yellow-400 aspect-square h-2 w-2" />
                    default
                  </Badge>
                )}
            </div>
            <div className="flex gap-5 mt-2">
              {agent?.visibility !== 'default'
                && (
                  <div>
                    <span>
                      {agent?.subscriberCount}
                    </span>
                    <span className="text-muted-foreground"> subscribers</span>
                  </div>
                )}
            </div>
            {!agent?.isOwn && agent?.visibility !== 'default'
              && (
                <div className="mt-2 space-x-3">
                  {agent?.isSubscribed
                    ? (
                        <Button
                          onClick={() => mutate(false)}
                          disabled={isTogglePending}
                          variant="secondary"
                          className="rounded-full w-25"
                        >
                          Subscribed
                        </Button>
                      )
                    : (
                        <Button
                          onClick={() => mutate(true)}
                          disabled={isTogglePending}
                          variant="secondary"
                          className="rounded-full w-25 bg-white text-black hover:bg-muted-foreground hover:text-black"
                        >
                          Subscribe
                        </Button>
                      )}
                  <Button variant="secondary" className="rounded-full">
                    Report
                  </Button>
                </div>
              )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="items-center justify-center relative space-y-4">
            <div>
              <ReactMarkdown>
                {agent?.description}
              </ReactMarkdown>
            </div>
            {agent?.showDetails
              && (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <div className="space-y-2">
                        <div>
                          <div className="text-muted-foreground">System Prompt: </div>
                          {agent?.systemPrompt}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewAgentPage;
