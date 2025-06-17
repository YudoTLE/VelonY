'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useFetchModelById, useToggleModelSubscriptionById } from '@/hooks/use-models';

import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

import {
  Cpu,
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
    <div className="flex-1 flex flex-col justify-center items-center gap-5 overscroll-y-auto">
      <Card className="relative size-fit m-4 px-8 max-w-2xl w-full bg-card/80">
        <div className="absolute -top-6 -left-6 size-32 bg-yellow-400 rounded-full -z-10 blur-xl opacity-25" />
        <div className="absolute -top-12 -left-12 size-64 bg-orange-500 rounded-full -z-10 blur-2xl opacity-20" />
        <div className="absolute -top-20 -left-20 size-128 bg-red-500 rounded-full -z-10 blur-3xl opacity-15" />
        <div className="absolute -bottom-6 -right-6 size-32 bg-cyan-400 rounded-full -z-10 blur-xl opacity-25" />
        <div className="absolute -bottom-12 -right-12 size-64 bg-blue-500 rounded-full -z-10 blur-2xl opacity-20" />
        <div className="absolute -bottom-20 -right-20 size-128 bg-purple-600 rounded-full -z-10 blur-3xl opacity-15" />

        {model?.isOwn
          && (
            <Button
              asChild
              variant="link"
              className="absolute top-0 right-0 text-blue-400 font-normal"
            >
              <Link href={`${model?.url}/edit`}>
                edit
              </Link>
            </Button>
          )}

        <CardHeader className="flex">
          {model?.visibility === 'default'
            ? (
                <Avatar className="size-15 mr-4 rounded-full">
                  <AvatarFallback className="rounded-lg bg-gradient-to-br from-orange-500 to-blue-500 cursor-default">
                    <Cpu size="30" className="text-white" />
                  </AvatarFallback>
                </Avatar>
              )
            : (
                <Avatar className="size-24 mr-8 rounded-full">
                  <AvatarFallback className="rounded-lg bg-gradient-to-br from-orange-500 to-blue-500 cursor-default">
                    <Cpu size="48" className="text-white" />
                  </AvatarFallback>
                </Avatar>
              )}
          <div>
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
                    <span className="bg-yellow-400 aspect-square h-2 w-2" />
                    default
                  </Badge>
                )}
            </div>
            <div className="flex gap-5 mt-2">
              {model?.visibility !== 'default'
                && (
                  <div>
                    <span>
                      {model?.subscriberCount}
                    </span>
                    <span className="text-muted-foreground"> subscribers</span>
                  </div>
                )}
            </div>
            {!model?.isOwn && model?.visibility !== 'default'
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
        </CardHeader>

        <CardContent>
          <div className="items-center justify-center relative space-y-4">
            <div>
              <ReactMarkdown>
                {model?.description}
              </ReactMarkdown>
            </div>
            {model?.showDetails
              && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="space-y-2">
                        <div>
                          <div className="text-muted-foreground">Model: </div>
                          <div>{model?.llm}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Endpoint: </div>
                          <div className="break-all">{model?.endpoint}</div>
                        </div>
                      </div>
                    </div>

                    {model?.config && model.config.length > 0 && (
                      <div>
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
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewModelPage;
