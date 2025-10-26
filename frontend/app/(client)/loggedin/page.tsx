'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import Cookies from 'universal-cookie';
import { Loader2 } from 'lucide-react';

export default function LoggedInPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    const cookies = new Cookies();
    const url = new URL(window.location.href);
    const token = url.searchParams.get('token');

    // do everything synchronously and go
    if (token) {
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
      cookies.set('token', token, {
        path: '/',
        sameSite: 'lax',
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
    }

    router.replace('/');
  }, [router, queryClient]);

  return (
    <main className="flex h-screen items-center justify-center bg-gray-50 text-gray-700">
      <div className="flex flex-col items-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <h1 className="mt-4 text-lg font-medium">Logging you in...</h1>
        <p className="text-sm text-gray-400">Please wait a moment</p>
      </div>
    </main>
  );
}
