'use client';

import * as React from 'react';
import Link from 'next/link';

import { useSessionTabState } from '@/hooks/use-session-state';
import { useRealtimeSyncConversations } from '@/hooks/use-conversations';

import {
  NavGroupConversations,
  NavPrivateConversations,
  NavDefaultAgents,
  NavSubscribedAgents,
  NavMyAgents,
  NavDefaultModels,
  NavSubscribedModels,
  NavMyModels,
} from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarMenu,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Button } from '@/components/ui/button';
import { JoinConversationDialog } from '@/components/join-conversation-dialog';

import {
  Bot,
  MessageSquare,
  Cpu,
  Settings,
  SquarePlus,
  Search,
  Hammer,
  Wrench,
  Info,
} from 'lucide-react';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  useRealtimeSyncConversations();
  const [value, setValue] = useSessionTabState('velony:sidebar:main-tabs', '');

  return (
    <Tabs
      value={value}
      onValueChange={setValue}
    >
      <Sidebar {...props}>
        <SidebarHeader>
          <Link href="/" className="no-underline text-3xl font-bold mx-auto my-3">
            <h1 className="">
              VelonY
            </h1>
          </Link>
          <TabsList className="w-full my-0">
            <TabsTrigger value="conversations"><MessageSquare /></TabsTrigger>
            <TabsTrigger value="agents"><Bot /></TabsTrigger>
            <TabsTrigger value="models"><Cpu /></TabsTrigger>
            <TabsTrigger value="settings"><Settings /></TabsTrigger>
          </TabsList>
        </SidebarHeader>
        <SidebarContent>
          <TabsContent value="conversations">
            <SidebarGroup>
              <SidebarGroupLabel className="my-0">Conversations</SidebarGroupLabel>
              <div className="flex gap-2 pb-2">
                <Button asChild size="xs" variant="secondary" className="flex-1 rounded-full">
                  <Link href="/">
                    <SquarePlus />
                    New
                  </Link>
                </Button>
                <JoinConversationDialog />
              </div>
              <SidebarMenu>
                <NavGroupConversations />
                <NavPrivateConversations />
              </SidebarMenu>
            </SidebarGroup>
          </TabsContent>
          <TabsContent value="agents">
            <SidebarGroup>
              <SidebarGroupLabel className="my-0 gap-1">
                Agents
                <HoverCard>
                  <HoverCardTrigger className="cursor-pointer">
                    <Info size="12" />
                  </HoverCardTrigger>
                  <HoverCardContent align="start" className="flex gap-3 bg-secondary size-fit max-w-sm">
                    <div>
                      <Bot size="32" />
                    </div>
                    <div className="text-xs ">
                      Defines the bot&apos;s personality and behavior through a system prompt. The name lets the bot know who it is and recognize other bots in group chats.
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </SidebarGroupLabel>
              <div className="flex gap-2 pb-2">
                <Button asChild size="xs" variant="secondary" className="flex-1 rounded-full">
                  <Link href="/a/create">
                    <Hammer />
                    Create
                  </Link>
                </Button>
                <Button asChild size="xs" variant="secondary" className="flex-1 rounded-full">
                  <Link href="/explore">
                    <Search />
                    Explore
                  </Link>
                </Button>
              </div>
              <SidebarMenu>
                <NavDefaultAgents />
                <NavSubscribedAgents />
                <NavMyAgents />
              </SidebarMenu>
            </SidebarGroup>
          </TabsContent>
          <TabsContent value="models">
            <SidebarGroup>
              <SidebarGroupLabel className="my-0 gap-1">
                Models
                <HoverCard>
                  <HoverCardTrigger className="cursor-pointer">
                    <Info size="12" />
                  </HoverCardTrigger>
                  <HoverCardContent align="start" className="flex gap-3 bg-secondary size-fit max-w-sm">
                    <div>
                      <Cpu size="32" />
                    </div>
                    <div className="text-xs ">
                      The underlying AI engine that powers the bot&apos;s intelligence and response generation. You can choose from different language models like GPT, Claude, DeepSeek, or any other LLM.
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </SidebarGroupLabel>
              <div className="flex gap-2 pb-2">
                <Button asChild size="xs" variant="secondary" className="flex-1 rounded-full">
                  <Link href="/m/create">
                    <Wrench />
                    Create
                  </Link>
                </Button>
                <Button asChild size="xs" variant="secondary" className="flex-1 rounded-full">
                  <Link href="/explore">
                    <Search />
                    Explore
                  </Link>
                </Button>
              </div>
              <SidebarMenu>
                <NavDefaultModels />
                <NavSubscribedModels />
                <NavMyModels />
              </SidebarMenu>
            </SidebarGroup>
          </TabsContent>
          <TabsContent value="settings">
            <SidebarGroup>
              <SidebarGroupLabel className="my-0">Settings</SidebarGroupLabel>
              <SidebarMenu>
              </SidebarMenu>
            </SidebarGroup>
          </TabsContent>
        </SidebarContent>
        <SidebarFooter>
          <NavUser />
        </SidebarFooter>
      </Sidebar>
    </Tabs>
  );
}
