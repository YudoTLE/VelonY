'use client';

import { useForm } from 'react-hook-form';
import { useCreateAgent } from '@/hooks/use-agents';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Switch } from '@/components/ui/switch';
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
import { Card, CardContent, CardFooter } from '@/components/ui/card';

const formSchema = z.object({
  visibility: z.enum(['private', 'public']),
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  description: z.string(),
  showDetails: z.boolean(),
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
      showDetails: false,
      systemPrompt: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutate(values);
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center overscroll-y-auto gap-10 p-8">
      <div className="text-center text-4xl font-bold">
        Create new Agent
      </div>
      <Card className="relative size-fit px-4 max-w-2xl w-full bg-card/80">
        <div className="absolute -top-6 -left-6 size-32 bg-emerald-400 rounded-full -z-10 blur-xl opacity-25" />
        <div className="absolute -top-12 -left-12 size-64 bg-green-500 rounded-full -z-10 blur-2xl opacity-20" />
        <div className="absolute -top-20 -left-20 size-128 bg-teal-500 rounded-full -z-10 blur-3xl opacity-15" />
        <div className="absolute -bottom-6 -right-6 size-32 bg-violet-400 rounded-full -z-10 blur-xl opacity-25" />
        <div className="absolute -bottom-12 -right-12 size-64 bg-purple-500 rounded-full -z-10 blur-2xl opacity-20" />
        <div className="absolute -bottom-20 -right-20 size-128 bg-indigo-600 rounded-full -z-10 blur-3xl opacity-15" />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <CardContent>
              <div className="items-center justify-center relative space-y-2">
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
                  name="showDetails"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between mt-4">
                      <h3 className="text-lg font-bold">Details</h3>
                      <div className="flex gap-2 items-center">
                        <FormLabel className="text-xs text-muted-foreground">
                          show in public
                        </FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
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
