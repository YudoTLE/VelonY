'use client';

import { MessageInput } from '@/components/message-input';

const MainPage = () => {
  return (
    <div className="flex-1 flex flex-col px-16 py-5">
      <div className="flex flex-col my-auto gap-10 max-y">
        <h1 className="text-4xl mx-auto font-bold">Ask me anything!</h1>
        <MessageInput
          maxTextareaHeight={300}
        />
      </div>
    </div>
  );
};

export default MainPage;
