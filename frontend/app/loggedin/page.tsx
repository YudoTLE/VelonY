'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import Cookies from 'universal-cookie';

const LoggedinPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get('token');

    if (token) {
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] });

      const cookies = new Cookies();
      cookies.set('token', token, {
        sameSite: 'lax',
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
        path: '/',
      });
    }

    router.replace('/');
  }, [router, queryClient]);

  return (
    <div>Logging you in...</div>
  );
};

export default LoggedinPage;
