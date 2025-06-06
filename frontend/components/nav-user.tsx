import {
  ChevronsUpDown,
  LogOut,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { User } from '@/types/user.types';
import { useMe } from '@/hooks/use-users';

const NavUserContent = ({ user, isPending }: { user?: User, isPending: boolean }) => {
  return (
    <>
      {isPending
        ? (
            <>
              <Skeleton className="h-8 w-8 rounded-lg" />
              <div className="grid flex-1 gap-1">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-3 w-[150px]" />
              </div>
            </>
          )
        : (
            <>
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user!.avatarUrl} alt={user!.name} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user!.name}</span>
                <span className="truncate text-xs">{user!.email}</span>
              </div>
            </>
          )}
    </>
  );
};

export function NavUser() {
  const { isMobile } = useSidebar();
  const { data: user, isPending } = useMe();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <NavUserContent user={user} isPending={isPending} />
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="font-normal flex gap-2">
              <NavUserContent user={user} isPending={isPending} />
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles />
                Upgrade to Pro
                {' '}
                <span className="italic text-muted-foreground">coming soon?</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`${process.env.BACKEND_URL}/auth/logout`}>
                <LogOut />
                Log out
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
