'use client';

import { MessageInput } from '@/components/message-input';

const MainPage = () => {
  return (
    <div className="flex flex-col my-auto gap-10 max-y">
      <h1 className="px-2 text-xl sm:text-4xl mx-auto text-center font-bold">Ask me anything!</h1>
      <MessageInput
        className="absolute sm:relative bottom-0"
        maxTextareaHeight={300}
      />
    </div>
  );
};

export default MainPage;
