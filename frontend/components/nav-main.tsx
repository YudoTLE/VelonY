'use client';

import { useSessionCollapseState } from '@/hooks/use-session-state';
import { useFetchConversations, useDeleteConversation } from '@/hooks/use-conversations';
import { useFetchAgents } from '@/hooks/use-agents';
import { useFetchModels } from '@/hooks/use-models';

import Link from 'next/link';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  MoreHorizontal,
  Trash2,
  UsersRound,
  UserRound,
  UserCog,
  Pencil,
} from 'lucide-react';
import { DropdownMenuSeparator } from '@radix-ui/react-dropdown-menu';

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
          <SidebarMenuButton tooltip={title}>
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
                              <span>{item?.title ?? item?.name ?? ''}</span>
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

export function NavMyAgents() {
  const { data, isPending } = useFetchAgents();

  return (
    <SidebarNavSection
      title="My Agents"
      icon={UserCog}
      sessionKey="velony:sidebar:my-agents"
      items={data?.list ?? []}
      isLoading={isPending}
      renderDropdownTrigger={() => (
        <>
          <MoreHorizontal />
          <span className="sr-only">More</span>
        </>
      )}
      renderDropdown={agent => (
        <>
          <DropdownMenuItem onSelect={() => console.log('Edit', agent)}>
            <Pencil className="text-muted-foreground mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => console.log('Delete', agent)}>
            <Trash2 className="text-muted-foreground mr-2" />
            Delete
          </DropdownMenuItem>
        </>
      )}
    />
  );
}

export function NavMyModels() {
  const { data, isPending } = useFetchModels();

  return (
    <SidebarNavSection
      title="My Models"
      icon={UserCog}
      sessionKey="velony:sidebar:my-models"
      items={data?.list ?? []}
      isLoading={isPending}
      renderDropdownTrigger={() => (
        <>
          <MoreHorizontal />
          <span className="sr-only">More</span>
        </>
      )}
      renderDropdown={model => (
        <>
          <DropdownMenuItem onSelect={() => console.log('Edit', model)}>
            <Pencil className="text-muted-foreground mr-2" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => console.log('Delete', model)}>
            <Trash2 className="text-muted-foreground mr-2" />
            Delete
          </DropdownMenuItem>
        </>
      )}
    />
  );
}

export function NavGroupConversations() {
  const { data, isPending } = useFetchConversations();

  return (
    <SidebarNavSection
      title="Group Conversations"
      icon={UsersRound}
      sessionKey="velony:sidebar:group-conversations"
      items={data?.list.filter(conversation => conversation.memberCount > 1) ?? []}
      isLoading={isPending}
      renderDropdownTrigger={() => (
        <>
          <MoreHorizontal />
          <span className="sr-only">More</span>
        </>
      )}
      renderDropdown={model => (
        <>
          <DropdownMenuItem onSelect={() => console.log('Leave', model)}>
            <Trash2 className="text-muted-foreground mr-2" />
            Leave
          </DropdownMenuItem>
        </>
      )}
    />
  );
}
export function NavPrivateConversations() {
  const { data: query, isPending: isFetchPending } = useFetchConversations();
  const { mutate: deleteConversation } = useDeleteConversation();

  return (
    <SidebarNavSection
      title="Private Conversations"
      icon={UserRound}
      sessionKey="velony:sidebar:private-conversations"
      items={query?.list.filter(conversation => conversation.isOwn && conversation.memberCount === 1) ?? []}
      isLoading={isFetchPending}
      renderDropdownTrigger={() => (
        <>
          <MoreHorizontal />
          <span className="sr-only">More</span>
        </>
      )}
      renderDropdown={conversation => (
        <>
          <DropdownMenuItem onSelect={() => {
            deleteConversation(conversation.id);
          }}
          >
            <Trash2 className="text-muted-foreground mr-2" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => {
              deleteConversation(conversation.id);
            }}
          >
            <Trash2 className="text-muted-foreground mr-2" />
            Delete
          </DropdownMenuItem>
        </>
      )}
    />
  );
}
