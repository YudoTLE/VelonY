'use client';

import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useFetchAgentById, useUpdateAgentById } from '@/hooks/use-agents';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { LoaderCircle, X } from 'lucide-react';

const formSchema = z.object({
  visibility: z.enum(['private', 'public', 'default']),
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  description: z.string(),
  systemPrompt: z.string(),
});

const EditAgentPage = () => {
  const params = useParams<{ id: string }>();
  const { id } = params;

  const { data: agent, error: fetchError, isPending: isFetchPending } = useFetchAgentById(id);
  const { mutate: updateAgent, isPending: isUpdatePending } = useUpdateAgentById(id);

  const [showVisibilityDialog, setShowVisibilityDialog] = useState(false);
  const [pendingVisibility, setPendingVisibility] = useState<'private' | 'public' | null>(null);
  const [pendingFormData, setPendingFormData] = useState<z.infer<typeof formSchema> | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      visibility: 'private',
      name: '',
      description: '',
      systemPrompt: '',
    },
  });

  useEffect(() => {
    if (agent) {
      form.reset({
        visibility: agent.visibility || 'private',
        name: agent.name || '',
        description: agent.description || '',
        systemPrompt: agent.systemPrompt || '',
      });
    }
  }, [agent, form]);

  const handleVisibilityChange = (newVisibility: string, formData: z.infer<typeof formSchema>) => {
    const currentVisibility = agent?.visibility;

    if (currentVisibility && currentVisibility !== newVisibility) {
      setPendingVisibility(newVisibility as 'private' | 'public');
      setPendingFormData(formData);
      setShowVisibilityDialog(true);
      return false;
    }

    return true;
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log('FORM VALUES', values);

    if (!handleVisibilityChange(values.visibility, values)) {
      return;
    }

    updateAgent(values);
  };

  const confirmVisibilityChange = () => {
    if (pendingFormData) {
      updateAgent(pendingFormData);
    }
    setShowVisibilityDialog(false);
    setPendingVisibility(null);
    setPendingFormData(null);
  };

  const cancelVisibilityChange = () => {
    if (agent) {
      form.setValue('visibility', agent.visibility || 'private');
    }
    setShowVisibilityDialog(false);
    setPendingVisibility(null);
    setPendingFormData(null);
  };

  if (fetchError) {
    return (
      <div className="flex-1 flex text-muted-foreground">
        <p className="m-auto">{fetchError.message || 'Unknown error occurred'}</p>
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
    <>
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
                Edit Agent
              </CardHeader>
              <CardContent>
                <div className="m-auto w-full space-y-5">
                  <div className="items-center justify-center relative space-y-10">
                    <div className="space-y-2">
                      <FormField
                        control={form.control}
                        name="visibility"
                        render={({ field }) => (
                          <FormItem className="flex items-baseline">
                            <FormLabel className="w-30 text-md">Visibility</FormLabel>
                            <div className="flex-1">
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select visibility" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="private">Private</SelectItem>
                                  <SelectItem value="public">Public</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
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
                  <Button type="submit" disabled={isUpdatePending} className="w-30">
                    {isUpdatePending ? 'Updating...' : 'Update'}
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>

      <AlertDialog open={showVisibilityDialog} onOpenChange={setShowVisibilityDialog}>
        <AlertDialogContent>
          <AlertDialogHeader className="relative">
            <AlertDialogCancel asChild className="size-8" onClick={cancelVisibilityChange}>
              <Button className="absolute right-0 top-0 border-none">
                <X className="h-4 w-4" />
              </Button>
            </AlertDialogCancel>
            <AlertDialogTitle>
              Make
              {' '}
              {agent?.name}
              {' '}
              {pendingVisibility}
              ?
            </AlertDialogTitle>
            <div className="space-y-4">
              {pendingVisibility === 'public'
                ? (
                    <>
                      <Alert variant="destructive">
                        <AlertDescription>
                          <strong>WARNING: This will make your agent discoverable to everyone.</strong>
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-2">
                        <p>Once public, anyone will be able to:</p>
                        <ul className="list-disc ml-6 space-y-1">
                          <li>See your agent&apos;s name and description in marketplace searches</li>
                          <li>Subscribe and use your agent</li>
                          <li>Generate responses using your agent</li>
                          <li>Share links to your agent publicly</li>
                        </ul>
                      </div>
                    </>
                  )
                : (
                    <>
                      <Alert variant="destructive">
                        <AlertDescription>
                          <strong>WARNING: This will permanently remove ALL subscribers from your agent.</strong>
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-2">
                        <p>This action will:</p>
                        <ul className="list-disc ml-6 space-y-1">
                          <li>Remove all current subscribers immediately</li>
                          <li>Users will lose access to this agent</li>
                          <li>Make your agent undiscoverable in the marketplace</li>
                          <li>Break all existing public links</li>
                        </ul>
                      </div>

                      <Alert>
                        <AlertDescription>
                          <strong>This action cannot be undone.</strong>
                          {' '}
                          If you make this agent public again later, you will have zero subscribers. All previous subscribers will be permanently lost.
                        </AlertDescription>
                      </Alert>
                    </>
                  )}
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              className="flex-1 bg-secondary text-red-400 hover:bg-red-700 hover:text-white"
              onClick={confirmVisibilityChange}
            >
              Make this agent
              {' '}
              {pendingVisibility}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EditAgentPage;
