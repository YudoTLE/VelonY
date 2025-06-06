'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAutosizeTextarea } from '@/hooks/use-autosize-textarea';
import { useSendMessageByConversation, useSendMessageByNewConversation } from '@/hooks/use-messages';
import { useFetchModels } from '@/hooks/use-models';
import { useFetchAgents } from '@/hooks/use-agents';

import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { ArrowUp } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from './ui/button';

export const MessageInput = ({
  conversationId,
  maxTextareaHeight = 100,
  className,
}: {
  conversationId?: string
  maxTextareaHeight?: number
  className?: string
}) => {
  const { mutate: sendMessage1 } = useSendMessageByConversation(conversationId ?? '');
  const { mutate: sendMessage2 } = useSendMessageByNewConversation();
  const { data: agentsQuery, isPending: isFetchAgentPending } = useFetchAgents();
  const { data: modelsQuery, isPending: isFetchModelPending } = useFetchModels();
  const { textareaRef, resize } = useAutosizeTextarea();

  const agents = useMemo(() => agentsQuery?.list ?? [], [agentsQuery?.list]);
  const models = useMemo(() => modelsQuery?.list ?? [], [modelsQuery?.list]);

  const [usedAgent, setUsedAgent] = useState<string | null>(null);
  const [usedModel, setUsedModel] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (agents.length > 0 && !usedAgent) {
      setUsedAgent(agents[0].id);
    }
  }, [agents, usedAgent]);
  useEffect(() => {
    if (models.length > 0 && !usedModel) {
      setUsedModel(models[0].id);
    }
  }, [models, usedModel]);

  const handleSendMessage = () => {
    if (!enabled) return;

    const el = textareaRef.current;
    if (!el) return;
    const content = el?.value.trim();
    // if (!content) return

    const sendMessage = async () => {
      if (conversationId) {
        if (!!content) {
          sendMessage1({
            type: 'user',
            content,
            extra: '',
          });
          el.value = '';
          resize();
        }
        else {
          sendMessage1({
            type: 'agent',
            content: '',
            extra: '',
            ...(usedAgent && { agentId: usedAgent }),
            ...(usedModel && { modelId: usedModel }),
          });
        }
      }
      else {
        sendMessage2({
          type: 'user',
          content,
          extra: '',
        });
        setEnabled(false);
      }
    };

    sendMessage();
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      handleSendMessage();
    }
  };

  return (
    <div className={cn('z-25 relative w-full max-w-2xl mx-auto group px-3', className)}>
      <div className="absolute inset-0 inset-x-2 inset-y-2 group-focus-within:inset-x-0 group-focus-within:inset-y-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-xl blur-xl opacity-30 group-focus-within:opacity-70 transition transition-all-200 animate-tilt" />

      <Card className="relative z-25 w-full py-4 gap-3 rounded-3xl shadow-lg backdrop-blur-sm bg-card/50 group-focus-within:bg-card/85">
        <CardContent>
          <ScrollArea
            className="flex flex-col flex-1 grow-1 basis-1 overflow-y-auto"
            style={{ maxHeight: `${maxTextareaHeight}px` }}
          >
            <textarea
              disabled={!enabled}
              ref={textareaRef}
              rows={1}
              placeholder="Type anything..."
              onInput={resize}
              onKeyDown={handleKeyDown}
              className={cn(
                'w-full resize-none bg-transparent border-none outline-none focus:ring-0 p-0 m-0',
                !enabled && 'opacity-50',
              )}
            />
          </ScrollArea>
        </CardContent>

        <CardFooter className="gap-3">
          <Select value={usedAgent ?? ''} onValueChange={setUsedAgent}>
            <SelectTrigger className={cn(
              'w-[150px] opacity-0 transition-opacity duration-300 group',
              !isFetchAgentPending && 'opacity-100',
            )}
            >
              <SelectValue placeholder="Agent" />
            </SelectTrigger>
            <SelectContent className="backdrop-blur-md bg-inherit">
              {agents.map((agent) => {
                return (
                  <SelectItem
                    key={agent.id}
                    value={agent.id}
                  >
                    {agent.name}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <Select value={usedModel ?? ''} onValueChange={setUsedModel}>
            <SelectTrigger className={cn(
              'w-[150px] opacity-0 transition-opacity duration-300',
              !isFetchModelPending && 'opacity-100',
            )}
            >
              <SelectValue placeholder="Model" />
            </SelectTrigger>
            <SelectContent className="backdrop-blur-md bg-inherit">
              {models.map((model) => {
                return (
                  <SelectItem
                    key={model.id}
                    value={model.id}
                  >
                    {model.name}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <div className="mx-auto" />
          <Button
            onClick={handleSendMessage}
            variant="ghost"
            className="border-1"
          >
            <ArrowUp />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
