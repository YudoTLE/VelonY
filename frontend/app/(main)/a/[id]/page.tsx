'use client';

import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useUpdateAgent, useFetchAgents } from '@/hooks/use-agents';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { TextareaAutosize } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { LoaderCircle } from 'lucide-react';

const formSchema = z.object({
  visibility: z.enum(['private', 'public', 'default']),
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  systemPrompt: z.string(),
  temperature: z.coerce.number().gte(0).lte(2),
});

const CreateAgentPage = () => {
  const params = useParams<{ id: string }>();
  const { id } = params;

  const { mutate, isPending: isUpdatePending } = useUpdateAgent(id);
  const { data: query, error: fetchError, isPending: isFetchPending } = useFetchAgents();

  const agent = query?.registry.get(id);

  const editable = !!agent && agent.isOwn;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      visibility: 'private',
      name: '',
      systemPrompt: '',
      temperature: 0.7,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutate(values);
  };

  useEffect(() => {
    if (agent) {
      form.reset({
        visibility: agent.visibility,
        name: agent.name,
        systemPrompt: agent.systemPrompt,
        temperature: agent.temperature,
      });
    }
  }, [agent, form]);

  if (fetchError) {
    return (
      <div className="flex-1 flex text-muted-foreground">
        <p className="m-auto">{fetchError.message || 'Unknown error occured'}</p>
      </div>
    );
  }

  if (isFetchPending) {
    return (
      <div className="flex-1 flex text-muted-foreground">
        <LoaderCircle className="m-auto animate-spin" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 h-screen flex">
        <div className="max-w-2xl m-auto w-full space-y-5 px-10">
          <div className="items-center justify-center relative">
            <div className="absolute left-0 top-2/3 -translate-x-1/2 -translate-y-1/2 size-40 bg-red-500 rounded-full -z-10 blur-3xl opacity-40" />
            <div className="absolute left-1/7 top-1/3 -translate-x-1/2 -translate-y-1/2 size-40 bg-blue-500 rounded-full -z-10 blur-3xl opacity-40" />

            <div className="text-4xl font-bold space-x-3 cursor-default">
              {agent?.name}
            </div>

            <div className="flex mt-2 items-center">
              {agent?.visibility === 'private'
                && (
                  <>
                    <Badge className="bg-red-800 cursor-default">
                      private
                    </Badge>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="link" size="xxs" className="italic text-muted-foreground hover:text-white">
                          make public?
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Make agent public?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Anyone will be able to view and use this agent.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => {
                            mutate({
                              ...agent,
                              visibility: 'public',
                            });
                          }}
                          >
                            Continue
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              {agent?.visibility === 'public'
                && (
                  <>
                    <Badge className="bg-green-700 cursor-default">
                      public
                    </Badge>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="link" size="xxs" className="italic text-muted-foreground hover:text-white">
                          make private?
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Make agent private?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action will make the agent inaccessible to others.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => {
                            mutate({
                              ...agent,
                              visibility: 'private',
                            });
                          }}
                          >
                            Continue
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              {agent?.visibility === 'default'
                && (
                  <>
                    <Badge className="bg-background cursor-default">
                      default
                    </Badge>
                  </>
                )}

            </div>

            <div className="space-y-2 mt-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex items-baseline">
                    <FormLabel className="w-30 text-md">Name</FormLabel>
                    <div className="flex-1">
                      <FormControl>
                        <Input disabled={!editable} placeholder="Your agent name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="systemPrompt"
                render={({ field }) => (
                  <FormItem className="flex items-baseline">
                    <FormLabel className="w-30 text-md">System Prompt</FormLabel>
                    <div className="flex-1">
                      <FormControl>
                        <TextareaAutosize
                          disabled={!editable}
                          placeholder="You are a helpful assistant."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="temperature"
                render={({ field }) => (
                  <FormItem className="flex items-baseline">
                    <FormLabel className="w-30 text-md">Temperature</FormLabel>
                    <div className="flex-1">
                      <FormControl>
                        <Input
                          type="number"
                          autoComplete="off"
                          disabled={!editable}
                          placeholder=""
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>
          {editable
            && (
              <div className="flex justify-end">
                <Button type="submit" disabled={isUpdatePending} className="w-30">
                  {isUpdatePending ? 'Updating...' : 'Update'}
                </Button>
              </div>
            )}
        </div>
      </form>
    </Form>
  );
};

export default CreateAgentPage;
