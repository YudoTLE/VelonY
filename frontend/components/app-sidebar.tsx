"use client"

import * as React from "react"
import { useSessionTabState } from '@/hooks/use-session-state'
import { useRealtimeSyncConversations } from '@/hooks/use-conversations'
import Link from 'next/link'
import {
  NavGroupConversations,
  NavPrivateConversations,
  NavMyAgents,
  NavMyModels,
} from '@/components/nav-main'
import { NavUser } from '@/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarMenu,
  SidebarGroupLabel,
} from '@/components/ui/sidebar'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs'
import { 
  Bot,
  MessageSquare,
  Cpu,
  Settings,
} from 'lucide-react'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {  
  useRealtimeSyncConversations()
  const [value, setValue] = useSessionTabState('velony:sidebar:main-tabs', '')

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
              <SidebarMenu>
                <NavGroupConversations />
                <NavPrivateConversations />
              </SidebarMenu>
            </SidebarGroup>
          </TabsContent>
          <TabsContent value="agents">
            <SidebarGroup>
              <SidebarGroupLabel className="my-0">Agents</SidebarGroupLabel>
              <SidebarMenu>
                <NavMyAgents />
              </SidebarMenu>
            </SidebarGroup>
          </TabsContent>
          <TabsContent value="models">
            <SidebarGroup>
              <SidebarGroupLabel className="my-0">Models</SidebarGroupLabel>
              <SidebarMenu>
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
  )
}
