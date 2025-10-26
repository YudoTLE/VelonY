'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import Cookies from 'universal-cookie';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    const cookies = new Cookies();
    cookies.remove('token', { path: '/' });

    router.push('/auth');
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 text-red-500 hover:text-red-600"
    >
      <LogOut />
      Log out
    </button>
  );
}
