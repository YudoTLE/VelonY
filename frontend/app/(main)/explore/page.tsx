'use client';

import { useFetchPublicAgents } from '@/hooks/use-agents';
import { useFetchPublicModels } from '@/hooks/use-models';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

import { Bot, Cpu } from 'lucide-react';

const CardSkeleton = () => {
  return (
    <Card className="w-84 border-none bg-secondary/50 flex-shrink-0">
      <CardContent className="flex h-full space-y-2 translate-y-0.5 gap-4">
        <div>
          <Skeleton className="size-24 rounded-full" />
        </div>
        <div className="flex-1 flex flex-col justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-2/3" />
          </div>
          <div className="flex items-center gap-1">
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ExplorePage = () => {
  const { data: agents, isPending: isFetchAgentsPending } = useFetchPublicAgents();
  const { data: models, isPending: isFetchModelsPending } = useFetchPublicModels();

  return (
    <div className="flex-1 flex flex-col p-5 relative">
      <h1 className="text-center font-bold text-4xl">
        Explore your Agent and Model!
      </h1>

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <div>
            <Button
              className="group bg-transparent text-lg"
              variant="secondary"
            >
              <div className="flex -translate-x-3 gap-2 group-hover:translate-x-0 transition-all duration-300 ease-in-out">
                <h2 className="group-hover:text-blue-200 transition-all duration-300 ease-in-out">
                  Agents
                </h2>
                <span className="text-blue-400 font-bold">{'>'}</span>
              </div>
            </Button>
          </div>

          <div className="relative overflow-x-auto h-38 no-scrollbar">
            <div className="absolute flex  gap-4">
              {isFetchAgentsPending
                && Array.from({ length: 6 }).map((_, index) => (
                  <CardSkeleton key={index} />
                ))}
              {!isFetchAgentsPending && agents?.map((agent, index) => {
                return (
                  <Link key={index} href={agent.url}>
                    <Card className="group w-84 border-none bg-secondary/50 hover:bg-secondary cursor-pointer transition-all duration-300 ease-in-out flex-shrink-0">
                      <CardContent className="flex h-full space-y-2 translate-y-0.5 gap-4 group-hover:-translate-y-0.5 transition-all duration-300 ease-in-out">
                        <div>
                          <Avatar className="size-24 rounded-full">
                            <AvatarFallback className="rounded-lg bg-gradient-to-br from-emerald-600 to-purple-600">
                              <Bot size="48" className="text-white" />
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <h3 className="text-xl">
                            {agent.name}
                          </h3>
                          <p>
                            {agent.subscriberCount}
                            {' '}
                            <span className="text-muted-foreground">subscribers</span>
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <div>
            <Button
              className="group bg-transparent text-lg"
              variant="secondary"
            >
              <div className="flex -translate-x-3 gap-2 group-hover:translate-x-0 transition-all duration-300 ease-in-out">
                <h2 className="group-hover:text-blue-200 transition-all duration-300 ease-in-out">
                  Models
                </h2>
                <span className="text-blue-400 font-bold">{'>'}</span>
              </div>
            </Button>
          </div>

          <div className="relative overflow-x-auto h-38 no-scrollbar">
            <div className="absolute flex  gap-4">
              {isFetchModelsPending
                && Array.from({ length: 6 }).map((_, index) => (
                  <CardSkeleton key={index} />
                ))}
              {!isFetchModelsPending && models?.map((model, index) => {
                return (
                  <Link key={index} href={model.url}>
                    <Card className="group w-84 border-none bg-secondary/50 hover:bg-secondary cursor-pointer transition-all duration-300 ease-in-out flex-shrink-0">
                      <CardContent className="flex h-full space-y-2 translate-y-0.5 gap-4 group-hover:-translate-y-0.5 transition-all duration-300 ease-in-out">
                        <div>
                          <Avatar className="size-24 rounded-full">
                            <AvatarFallback className="rounded-lg bg-gradient-to-br from-orange-500 to-blue-500">
                              <Cpu size="48" className="text-white" />
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <h3 className="text-xl">
                            {model.name}
                          </h3>
                          <p>
                            {model.subscriberCount}
                            {' '}
                            <span className="text-muted-foreground">subscribers</span>
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;
