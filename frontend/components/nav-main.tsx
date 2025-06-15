'use client';

import { useSessionCollapseState } from '@/hooks/use-session-state';
import { useFetchConversations } from '@/hooks/use-conversations';
import { useFetchDefaultAgents, useFetchSubscribedAgents, useFetchPrivateAgents } from '@/hooks/use-agents';
import { useFetchDefaultModels, useFetchSubscribedModels, useFetchPrivateModels } from '@/hooks/use-models';

import Link from 'next/link';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';

import {
  ChevronRight,
  UsersRound,
  UserRound,
  PencilLine,
  Flame,
  Box,
} from 'lucide-react';

interface SidebarNavItem {
  title?: string
  name?: string
  url: string
}

interface SidebarNavSectionProps<T extends SidebarNavItem = SidebarNavItem> {
  title: string
  icon: React.ElementType
  sessionKey: string
  items: T[]
  isLoading?: boolean
  renderDropdown?: (item: T) => React.ReactNode
  renderDropdownTrigger?: (item: T) => React.ReactNode
}

const SidebarNavSection = <T extends SidebarNavItem>({
  title,
  icon: Icon,
  sessionKey,
  items,
  isLoading = false,
  renderDropdown,
  renderDropdownTrigger,
}: SidebarNavSectionProps<T>) => {
  const [open, setOpen] = useSessionCollapseState(sessionKey);
  const { isMobile } = useSidebar();

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton className="cursor-pointer" tooltip={title}>
            <Icon />
            <span>{title}</span>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
      </SidebarMenuItem>

      <CollapsibleContent>
        <SidebarMenuSub>
          {isLoading
            ? (
                <>
                  <Skeleton className="h-5 my-1 w-5/6" />
                  <Skeleton className="h-5 my-1 w-5/6" />
                </>
              )
            : (
                items.length === 0
                  ? (
                      <div className="italic text-muted-foreground text-xs">-- Empty --</div>
                    )
                  : (
                      items.map((item, idx) => (
                        <SidebarMenuSubItem key={idx} className="group/sideitem">
                          <SidebarMenuSubButton asChild>
                            <Link href={item.url}>
                              <span>{(item?.title ?? item?.name ?? '')}</span>
                            </Link>
                          </SidebarMenuSubButton>

                          {renderDropdown && renderDropdownTrigger && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <SidebarMenuAction className="opacity-0 group-hover/sideitem:opacity-100 transition-opacity">
                                  {renderDropdownTrigger(item)}
                                </SidebarMenuAction>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                className="w-48 rounded-lg"
                                side={isMobile ? 'bottom' : 'right'}
                                align={isMobile ? 'end' : 'start'}
                              >
                                {renderDropdown(item)}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}

                        </SidebarMenuSubItem>
                      ))
                    )
              )}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  );
};

export function NavDefaultAgents() {
  const { data, isPending } = useFetchDefaultAgents();

  return (
    <SidebarNavSection
      title="Defaults"
      icon={Box}
      sessionKey="velony:sidebar:default-agents"
      items={data ?? []}
      isLoading={isPending}
    />
  );
}

export function NavSubscribedAgents() {
  const { data, isPending } = useFetchSubscribedAgents();

  return (
    <SidebarNavSection
      title="Subscriptions"
      icon={Flame}
      sessionKey="velony:sidebar:subscribed-agents"
      items={data ?? []}
      isLoading={isPending}
    />
  );
}

export function NavMyAgents() {
  const { data, isPending } = useFetchPrivateAgents();

  return (
    <SidebarNavSection
      title="My Creations"
      icon={PencilLine}
      sessionKey="velony:sidebar:my-agents"
      items={data?.filter(agent => agent.visibility !== 'default') ?? []}
      isLoading={isPending}
    />
  );
}

export function NavMyModels() {
  const { data, isPending } = useFetchPrivateModels();

  return (
    <SidebarNavSection
      title="My Creations"
      icon={PencilLine}
      sessionKey="velony:sidebar:my-models"
      items={data?.filter(agent => agent.visibility !== 'default') ?? []}
      isLoading={isPending}
    />
  );
}

export function NavDefaultModels() {
  const { data, isPending } = useFetchDefaultModels();

  return (
    <SidebarNavSection
      title="Defaults"
      icon={Box}
      sessionKey="velony:sidebar:default-models"
      items={data ?? []}
      isLoading={isPending}
    />
  );
}

export function NavSubscribedModels() {
  const { data, isPending } = useFetchSubscribedModels();

  return (
    <SidebarNavSection
      title="Subscriptions"
      icon={Flame}
      sessionKey="velony:sidebar:subscribed-models"
      items={data ?? []}
      isLoading={isPending}
    />
  );
}

export function NavGroupConversations() {
  const { data, isPending } = useFetchConversations();

  return (
    <SidebarNavSection
      title="Group"
      icon={UsersRound}
      sessionKey="velony:sidebar:group-conversations"
      items={data?.filter(conversation => conversation.participants.length > 1) ?? []}
      isLoading={isPending}
    />
  );
}
export function NavPrivateConversations() {
  const { data, isPending } = useFetchConversations();

  return (
    <SidebarNavSection
      title="Private"
      icon={UserRound}
      sessionKey="velony:sidebar:private-conversations"
      items={data?.filter(conversation => conversation.isOwn && conversation.participants.length === 1) ?? []}
      isLoading={isPending}
    />
  );
}
