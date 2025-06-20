'use client';

import { useParams } from 'next/navigation';
import { useJoinConversationById } from '@/hooks/use-conversations';
import { useMe } from '@/hooks/use-users';
import { useEffect } from 'react';

import { LoaderCircle } from 'lucide-react';

const JoinConversationPage = () => {
  const params = useParams<{ id: string }>();
  const { id } = params;

  const { data: me, isLoading: isMeLoading } = useMe();
  const { mutate, error, isPending } = useJoinConversationById(id);

  useEffect(() => {
    if (me && !isMeLoading) {
      mutate();
    }
  }, [mutate, me, isMeLoading]);

  if (isMeLoading || isPending) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <div className="flex text-muted-foreground gap-2">
          <LoaderCircle className="m-auto animate-spin" />
          {isMeLoading ? 'Loading...' : 'Joining'}
        </div>
      </div>
    );
  }

  if (!me) {
    return (
      <div className="flex-1 flex text-muted-foreground">
        <p className="m-auto">Please log in to join this conversation</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex text-muted-foreground">
        <p className="m-auto">{error.message || 'Unknown error occurred'}</p>
      </div>
    );
  }

  return null;
};

export default JoinConversationPage;
