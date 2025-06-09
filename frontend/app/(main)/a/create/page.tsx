'use client';

import { useForm } from 'react-hook-form';
import { useCreateAgent } from '@/hooks/use-agents';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { TextareaAutosize } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';

const formSchema = z.object({
  visibility: z.enum(['private', 'public']),
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  description: z.string(),
  systemPrompt: z.string(),
});

const CreateAgentPage = () => {
  const { mutate, isPending } = useCreateAgent();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      visibility: 'private',
      name: '',
      description: '',
      systemPrompt: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutate(values);
  };

  return (
    <div className="flex flex-col justify-center items-center gap-5 overscroll-y-auto">
      <Card className="relative size-fit mx-4 my-16 px-8 max-w-2xl w-full bg-card/80">
        <div className="absolute -top-6 -left-6 size-32 bg-emerald-400 rounded-full -z-10 blur-xl opacity-50" />
        <div className="absolute -top-12 -left-12 size-64 bg-green-500 rounded-full -z-10 blur-2xl opacity-40" />
        <div className="absolute -top-20 -left-20 size-128 bg-teal-500 rounded-full -z-10 blur-3xl opacity-30" />
        <div className="absolute -bottom-6 -right-6 size-32 bg-violet-400 rounded-full -z-10 blur-xl opacity-60" />
        <div className="absolute -bottom-12 -right-12 size-64 bg-purple-500 rounded-full -z-10 blur-2xl opacity-40" />
        <div className="absolute -bottom-20 -right-20 size-128 bg-indigo-600 rounded-full -z-10 blur-3xl opacity-30" />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <CardHeader className="text-center text-4xl font-bold">
              Create New Agent
            </CardHeader>
            <CardContent>
              <div className="m-auto w-full space-y-5">
                <div className="items-center justify-center relative space-y-10">
                  <div className="space-y-2">

                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="flex items-baseline">
                          <FormLabel className="w-30 text-md">Name</FormLabel>
                          <div className="flex-1">
                            <FormControl>
                              <Input placeholder="Virgo" {...field} />
                            </FormControl>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="flex items-baseline">
                          <FormLabel className="w-30 text-md">Description</FormLabel>
                          <div className="flex-1">
                            <FormControl>
                              <TextareaAutosize
                                placeholder="Cool AI assistant."
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
                      name="systemPrompt"
                      render={({ field }) => (
                        <FormItem className="flex items-baseline">
                          <FormLabel className="w-30 text-md">System Prompt</FormLabel>
                          <div className="flex-1">
                            <FormControl>
                              <TextareaAutosize
                                placeholder="You are a helpful assistant."
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
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <div>
                <Button type="submit" disabled={isPending} className="w-30">
                  {isPending ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default CreateAgentPage;
