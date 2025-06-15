'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useFetchAgentById, useUpdateAgentById, useDeleteAgentById } from '@/hooks/use-agents';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';

import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { Badge } from '@/components/ui/badge';
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

import { LoaderCircle, X, Bot } from 'lucide-react';

const formSchema = z.object({
  visibility: z.enum(['private', 'public', 'default']),
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  showDetails: z.boolean(),
  description: z.string(),
  systemPrompt: z.string(),
});

const EditAgentPage = () => {
  const params = useParams<{ id: string }>();
  const { id } = params;

  const { data: agent, error: fetchError, isPending: isFetchPending } = useFetchAgentById(id);
  const { mutate: updateAgent, isPending: isUpdatePending } = useUpdateAgentById(id);
  const { mutate: deleteAgent } = useDeleteAgentById(id);

  const [showVisibilityDialog, setShowVisibilityDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [originalValues, setOriginalValues] = useState<z.infer<typeof formSchema> | null>(null);

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

  const currentValues = form.watch();
  const hasChanges = originalValues && JSON.stringify(currentValues) !== JSON.stringify(originalValues);
  const { formState: { dirtyFields } } = form;

  useEffect(() => {
    if (agent) {
      const values = {
        visibility: agent.visibility || 'private',
        name: agent.name || '',
        description: agent.description || '',
        showDetails: agent.showDetails,
        systemPrompt: agent.systemPrompt || '',
      };
      form.reset(values);
      setOriginalValues(values);
    }
  }, [agent, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    updateAgent(values);
  };

  const onRevert = () => {
    if (originalValues) {
      form.reset(originalValues);
    }
  };

  const handleVisibilityChange = () => {
    const newVisibility = agent?.visibility === 'private' ? 'public' : 'private';
    updateAgent({
      visibility: newVisibility,
      name: agent?.name || '',
      description: agent?.description || '',
      systemPrompt: agent?.systemPrompt || '',
    });
    setShowVisibilityDialog(false);
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
      <div className="flex-1 flex flex-col justify-center items-center overscroll-y-auto">
        <Card className="relative size-fit m-4 px-4 max-w-2xl w-full bg-card/80">
          <div className="absolute -top-6 -left-6 size-32 bg-emerald-400 rounded-full -z-10 blur-xl opacity-25" />
          <div className="absolute -top-12 -left-12 size-64 bg-green-500 rounded-full -z-10 blur-2xl opacity-20" />
          <div className="absolute -top-20 -left-20 size-128 bg-teal-500 rounded-full -z-10 blur-3xl opacity-15" />
          <div className="absolute -bottom-6 -right-6 size-32 bg-violet-400 rounded-full -z-10 blur-xl opacity-25" />
          <div className="absolute -bottom-12 -right-12 size-64 bg-purple-500 rounded-full -z-10 blur-2xl opacity-20" />
          <div className="absolute -bottom-20 -right-20 size-128 bg-indigo-600 rounded-full -z-10 blur-3xl opacity-15" />

          <Button
            asChild
            variant="link"
            className="absolute top-0 right-0 text-blue-400 font-normal"
          >
            <Link href={agent?.url}>
              view
            </Link>
          </Button>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <CardHeader className="flex">
                {agent?.visibility === 'default'
                  ? (
                      <Avatar className="size-15 mr-4 rounded-full">
                        <AvatarFallback className="rounded-lg bg-gradient-to-br from-emerald-600 to-purple-600 cursor-default">
                          <Bot size="30" className="text-white" />
                        </AvatarFallback>
                      </Avatar>
                    )
                  : (
                      <Avatar className="size-24 mr-8 rounded-full">
                        <AvatarFallback className="rounded-lg bg-gradient-to-br from-emerald-600 to-purple-600 cursor-default">
                          <Bot size="48" className="text-white" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                <div className="">
                  <div className="text-2xl font-bold">
                    {agent?.name}
                  </div>
                  <div>
                    {agent?.visibility === 'private'
                      && (
                        <div className="">
                          <Badge className="bg-secondary cursor-default border-border">
                            <span className="bg-gray-500 rounded-full aspect-square h-2 w-2" />
                            private
                          </Badge>
                          <Button
                            disabled={isUpdatePending || !!hasChanges}
                            type="button"
                            className="text-red-600 font-normal"
                            size="xxs"
                            variant="link"
                            onClick={() => setShowVisibilityDialog(true)}
                          >
                            make public
                          </Button>
                        </div>
                      )}
                    {agent?.visibility === 'public'
                      && (
                        <>
                          <Badge className="bg-secondary cursor-default border-border">
                            <span className="bg-green-400 rounded-full aspect-square h-2 w-2" />
                            public
                          </Badge>
                          <Button
                            disabled={isUpdatePending || !!hasChanges}
                            type="button"
                            className="text-red-600 font-normal"
                            size="xxs"
                            variant="link"
                            onClick={() => setShowVisibilityDialog(true)}
                          >
                            make private
                          </Button>
                        </>
                      )}
                    {agent?.visibility === 'default'
                      && (
                        <Badge className="bg-secondary cursor-default border-border">
                          <span className="bg-yellow-400 aspect-square h-2 w-2" />
                          default
                        </Badge>
                      )}

                  </div>
                  <div className="flex gap-5 mt-2">
                    {agent?.visibility !== 'default'
                      && (
                        <div>
                          <span>
                            {agent?.subscriberCount}
                          </span>
                          <span className="text-muted-foreground"> subscribers</span>
                        </div>
                      )}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="items-center justify-center relative space-y-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="flex items-baseline">
                        <FormLabel className="w-30 text-md">
                          Name
                          {dirtyFields.name && '*'}
                        </FormLabel>
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
                        <FormLabel className="w-30 text-md">
                          Description
                          {dirtyFields.description && '*'}
                        </FormLabel>
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
                            show in view
                            {dirtyFields.showDetails && '*'}
                          </FormLabel>
                          <FormControl>
                            <Switch
                              className="cursor-pointer"
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
                        <FormLabel className="w-30 text-md">
                          System Prompt
                          {dirtyFields.systemPrompt && '*'}
                        </FormLabel>
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
              <CardFooter className="justify-between">
                <div>
                  <Button
                    variant="outline"
                    type="button"
                    disabled={isUpdatePending}
                    className="w-30 text-red-500"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    Delete
                  </Button>
                </div>
                <div className="flex gap-3">
                  <div>
                    <Button
                      variant="secondary"
                      type="button"
                      disabled={isUpdatePending || !hasChanges}
                      className="w-30"
                      onClick={onRevert}
                    >
                      Revert
                    </Button>
                  </div>
                  <div>
                    <Button
                      type="submit"
                      disabled={isUpdatePending || !hasChanges}
                      className="w-30"
                    >
                      {isUpdatePending ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>

      <AlertDialog open={showVisibilityDialog} onOpenChange={setShowVisibilityDialog}>
        <AlertDialogContent>
          <AlertDialogHeader className="relative">
            <AlertDialogCancel asChild className="size-8" onClick={() => setShowVisibilityDialog(false)}>
              <Button className="absolute right-0 top-0 border-none">
                <X className="h-4 w-4" />
              </Button>
            </AlertDialogCancel>
            <AlertDialogTitle>
              Make
              {' '}
              {agent?.name}
              {' '}
              {agent?.visibility === 'private' ? 'public' : 'private'}
              ?
            </AlertDialogTitle>
            <div className="space-y-4">
              {agent?.visibility === 'private'
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
              className="flex-1 bg-secondary text-red-500 hover:bg-red-700 hover:text-white"
              onClick={handleVisibilityChange}
            >
              Make this agent
              {' '}
              {agent?.visibility === 'private' ? 'public' : 'private'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader className="relative">
            <AlertDialogCancel asChild className="size-8" onClick={() => setShowDeleteDialog(false)}>
              <Button className="absolute right-0 top-0 border-none">
                <X className="h-4 w-4" />
              </Button>
            </AlertDialogCancel>
            <AlertDialogTitle>
              Delete
              {' '}
              {agent?.name}
              ?
            </AlertDialogTitle>
            <div className="space-y-4">

              <Alert variant="destructive">
                <AlertDescription>
                  <strong>WARNING: This agent will be permanently deleted and cannot be recovered.</strong>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <p>This action will:</p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Permanently delete this agent</li>
                  <li>Make the agent completely inaccessible to all users</li>
                  <li>Break all existing public links permanently</li>
                </ul>
              </div>

              <Alert>
                <AlertDescription>
                  <strong>This action cannot be undone.</strong>
                </AlertDescription>
              </Alert>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              className="flex-1 bg-secondary text-red-500 hover:bg-red-700 hover:text-white"
              onClick={() => deleteAgent()}
            >
              Delete this agent
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EditAgentPage;
