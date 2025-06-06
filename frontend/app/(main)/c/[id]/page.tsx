'use client';

import { useParams } from 'next/navigation';
import { MessageContainer } from '@/components/message-container';
import { MessageInput } from '@/components/message-input';

const ConversationPage = () => {
  const params = useParams<{ id: string }>();
  const { id } = params;

  return (
    <div className="flex-1 flex flex-col px-1 py-5 relative items-center align-middle">
      <MessageContainer
        conversationId={id}
        scrollOverlap={102}
      />
      <MessageInput
        conversationId={id}
        className="absolute bottom-3 left-1/2 transform -translate-x-1/2"
        maxTextareaHeight={400}
      />
    </div>
  );
};

export default ConversationPage;
