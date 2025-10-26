'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import Cookies from 'universal-cookie';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function LoggedInPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get('token');

    if (token) {
      const cookies = new Cookies();
      cookies.set('token', token, {
        path: '/',
        sameSite: 'lax',
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      // Update cached user data
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
    }

    router.replace('/');
  }, [router, queryClient]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <Card className="w-[320px] p-6 flex flex-col items-center gap-4 shadow-sm">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <Separator className="w-full" />
        <CardContent className="p-0 text-center">
          <h1 className="text-base font-medium">Logging you in…</h1>
          <p className="text-sm text-muted-foreground">Redirecting shortly</p>
        </CardContent>
      </Card>
    </main>
  );
}
