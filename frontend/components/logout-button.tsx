'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import Cookies from 'universal-cookie';
import { cn } from '@/lib/utils';

export default function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();

  const handleLogout = () => {
    const cookies = new Cookies();
    cookies.remove('token', { path: '/' });

    router.push('/auth');
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={cn(
        'relative flex w-full cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
        'text-foreground hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive',
        '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
        className,
      )}
    >
      <LogOut />
      <span>Log out</span>
    </button>
  );
}
