'use client';

import { useParams } from 'next/navigation';
import { useFetchModelById, useToggleModelSubscriptionById } from '@/hooks/use-models';

import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import {
  Bot,
  LoaderCircle,
} from 'lucide-react';

import ReactMarkdown from 'react-markdown';

const ViewModelPage = () => {
  const params = useParams<{ id: string }>();
  const { id } = params;

  const { data: model, error: fetchError, isPending: isFetchPending } = useFetchModelById(id);
  const { mutate, isPending: isTogglePending } = useToggleModelSubscriptionById(id);

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
    <div className="flex flex-col justify-center items-center gap-5 overscroll-y-auto">
      <Card className="relative size-fit mx-4 my-16 px-8 max-w-2xl w-full bg-card/80">
        <div className="absolute -top-6 -left-6 size-32 bg-yellow-400 rounded-full -z-10 blur-xl opacity-50" />
        <div className="absolute -top-12 -left-12 size-64 bg-orange-500 rounded-full -z-10 blur-2xl opacity-40" />
        <div className="absolute -top-20 -left-20 size-128 bg-red-500 rounded-full -z-10 blur-3xl opacity-30" />
        <div className="absolute -bottom-6 -right-6 size-32 bg-cyan-400 rounded-full -z-10 blur-xl opacity-60" />
        <div className="absolute -bottom-12 -right-12 size-64 bg-blue-500 rounded-full -z-10 blur-2xl opacity-40" />
        <div className="absolute -bottom-20 -right-20 size-128 bg-purple-600 rounded-full -z-10 blur-3xl opacity-30" />

        <CardContent>
          <div className="space-y-6">
            <div className="items-center justify-center relative">
              <div className="flex gap-8">
                <Avatar className="h-24 w-24 rounded-full">
                  <AvatarFallback className="rounded-lg bg-gradient-to-br from-orange-500 to-blue-500 cursor-default">
                    <Bot size="48" className="text-white" />
                  </AvatarFallback>
                </Avatar>
                <div className="">
                  <div className="text-2xl font-bold">
                    {model?.name}
                  </div>
                  <div>
                    {model?.visibility === 'private'
                      && (
                        <Badge className="bg-secondary cursor-default border-border">
                          <span className="bg-gray-500 rounded-full aspect-square h-2 w-2" />
                          private
                        </Badge>
                      )}
                    {model?.visibility === 'public'
                      && (
                        <Badge className="bg-secondary cursor-default border-border">
                          <span className="bg-green-400 rounded-full aspect-square h-2 w-2" />
                          public
                        </Badge>
                      )}
                    {model?.visibility === 'default'
                      && (
                        <Badge className="bg-secondary cursor-default border-border">
                          <span className="bg-yellow-400 aspect-square h-0.5 w-2" />
                          default
                        </Badge>
                      )}
                  </div>
                  <div className="flex gap-5 mt-2">
                    <div>
                      <span>
                        {model?.subscriberCount}
                      </span>
                      <span className="text-muted-foreground"> subscribers</span>
                    </div>
                  </div>
                  {!model?.isOwn
                    && (
                      <div className="mt-2 space-x-3">
                        {model?.isSubscribed
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
              </div>

              <Separator className="my-4 border" />

              <div className="">
                <ReactMarkdown>
                  {model?.description}
                </ReactMarkdown>
              </div>

              <Separator className="my-4 border" />

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Model Details</h3>
                    <div className="space-y-2">
                      <div>
                        <div className="text-muted-foreground">LLM: </div>
                        <div>{model?.llmModel}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Endpoint: </div>
                        <div className="break-all">{model?.endpointUrl}</div>
                      </div>
                    </div>
                  </div>

                  {model?.config && model.config.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Configuration</h3>
                      <div className="space-y-2">
                        {model.config.map((configItem, index) => (
                          <div key={index} className="">
                            <div className="text-muted-foreground">
                              {configItem.name}
                              :
                            </div>
                            <div className="font-mono text-sm">
                              {typeof configItem.value === 'boolean'
                                ? configItem.value.toString()
                                : configItem.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewModelPage;
