'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { useAutosizeTextarea } from '@/hooks/use-autosize-textarea';
import { useSendMessageByConversation, useSendMessageByNewConversation } from '@/hooks/use-messages';
import { useFetchAllMyModels } from '@/hooks/use-models';
import { useFetchAllMyAgents } from '@/hooks/use-agents';

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

import { ArrowUp, Bot, Cpu, Sparkles } from 'lucide-react';

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
  const { data: agentsQuery, isPending: isFetchAgentPending } = useFetchAllMyAgents();
  const { data: modelsQuery, isPending: isFetchModelPending } = useFetchAllMyModels();
  const { textareaRef, resize } = useAutosizeTextarea();

  const agents = useMemo(() => agentsQuery ?? [], [agentsQuery]);
  const models = useMemo(() => modelsQuery ?? [], [modelsQuery]);

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

  const [triggerBotCuePlaying, setTriggerBotCuePlaying] = useState(false);
  const [triggerBotUseCount, setTriggerBotUseCount] = useState(0);
  const triggerBotTimerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTriggerBotCueTimer = () => {
    setTriggerBotCuePlaying(false);

    if (triggerBotTimerRef.current) {
      clearTimeout(triggerBotTimerRef.current);
    }

    triggerBotTimerRef.current = setTimeout(() => {
      setTriggerBotCuePlaying(true);
    }, 5000 * Math.pow(2, triggerBotUseCount));
  };

  useEffect(() => {
    resetTriggerBotCueTimer();

    return () => {
      if (triggerBotTimerRef.current) {
        clearTimeout(triggerBotTimerRef.current);
      }
    };
  }, []);

  const handleSendMessage = () => {
    if (!enabled) return;

    const el = textareaRef.current;
    if (!el) return;
    const content = el?.value.trim();
    if (!content) return;

    resetTriggerBotCueTimer();

    const sendMessage = () => {
      if (conversationId) {
        sendMessage1({
          type: 'user',
          content,
          extra: '',
        });
        el.value = '';
        resize();
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
  const handleTriggerBot = () => {
    if (!usedAgent || !usedModel) return;

    resetTriggerBotCueTimer();
    setTriggerBotUseCount(triggerBotUseCount + 1);

    if (conversationId) {
      sendMessage1({
        type: 'agent',
        content: `agent ${usedAgent}`,
        extra: '',
        agentId: usedAgent,
        modelId: usedModel,
      });
    }
    else {
      sendMessage2({
        type: 'agent',
        content: `agent ${usedAgent}`,
        extra: '',
        agentId: usedAgent,
        modelId: usedModel,
      });
      setEnabled(false);
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleTriggerBot();
    }
  };

  return (
    <div className={cn('z-25 relative w-full max-w-2xl mx-auto group sm:px-3', className)}>
      <div className="animate-tilt-container absolute inset-0 inset-x-2 inset-y-2 group-focus-within:inset-x-0 group-focus-within:inset-y-0">
        <div className="w-full h-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-xl blur-xl opacity-30 group-focus-within:opacity-70 transition" />
      </div>

      <Card className="relative z-25 w-full py-4 gap-3 rounded-none rounded-t-3xl sm:rounded-3xl  bg-card/80 group-focus-within:bg-card/100">
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

          <Button
            type="button"
            onClick={handleTriggerBot}
            variant="outline"
            className={cn(
              'border-1 bg-transparent opacity-0 transition-opacity duration-300 group relative',
              !isFetchAgentPending && !isFetchModelPending && 'opacity-100',
            )}
          >
            <Sparkles className="absolute" />
            <div className={cn('absolute opacity-0 rounded-full size-10 bg-white/10', triggerBotCuePlaying && 'opacity-100 animate-ping')} />
            <Sparkles className={cn('text-blue-300', triggerBotCuePlaying && 'animate-pulse')} />
          </Button>
          <Select value={usedAgent ?? ''} onValueChange={setUsedAgent}>
            <SelectTrigger className={cn(
              'sm:w-[150px] cursor-pointer hover:bg-muted opacity-0 transition-opacity duration-300 group',
              !isFetchAgentPending && 'opacity-100',
            )}
            >
              <Bot />
              <div className="hidden sm:block truncate">
                <SelectValue placeholder="Agent" />
              </div>
            </SelectTrigger>
            <SelectContent>
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
              'sm:w-[150px] cursor-pointer hover:bg-muted opacity-0 transition-opacity duration-300',
              !isFetchModelPending && 'opacity-100',
            )}
            >
              <Cpu />
              <div className="hidden sm:block truncate">
                <SelectValue placeholder="Model" />
              </div>
            </SelectTrigger>
            <SelectContent>
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
            variant="outline"
            className="border-1 bg-transparent"
          >
            <ArrowUp />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
