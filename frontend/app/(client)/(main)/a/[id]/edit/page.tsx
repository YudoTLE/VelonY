'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import {
  useFetchAgentById,
  useUpdateAgentById,
  useDeleteAgentById,
  useUpdateAgentAvatarById,
} from '@/hooks/use-agents';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';

import NextError from 'next/error';

import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { getAgentAvatarUrl } from '@/lib/agent-avatar';
import { parseAgentInteractionMode } from '@/lib/agent-interaction-mode';

import { Camera, LoaderCircle, X, Bot } from 'lucide-react';

const formSchema = z.object({
  visibility: z.enum(['private', 'public', 'default']),
  interactionMode: z.enum(['assistant', 'participant']),
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  showDetails: z.boolean(),
  description: z.string(),
  systemPrompt: z.string(),
});

type AgentFormValues = z.infer<typeof formSchema>;

const normalizeAgentFormValues = (
  values: Partial<AgentFormValues>,
  fallback?: AgentFormValues | null,
): AgentFormValues => ({
  visibility: values.visibility ?? fallback?.visibility ?? 'private',
  interactionMode: parseAgentInteractionMode(values.interactionMode, fallback?.interactionMode),
  name: values.name ?? fallback?.name ?? '',
  description: values.description ?? fallback?.description ?? '',
  showDetails: values.showDetails ?? fallback?.showDetails ?? false,
  systemPrompt: values.systemPrompt ?? fallback?.systemPrompt ?? '',
});

const getAgentFormValues = (agent: Agent): AgentFormValues =>
  normalizeAgentFormValues({
    visibility: agent.visibility,
    interactionMode: agent.interactionMode,
    name: agent.name,
    description: agent.description,
    showDetails: agent.showDetails,
    systemPrompt: agent.systemPrompt || '',
  });

const avatarOutputSize = 512;
const acceptedAvatarTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Failed to read avatar image'));
    image.src = src;
  });

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('Failed to read avatar image'));
    reader.readAsDataURL(file);
  });

const createWebpAvatarFile = async (file: File) => {
  if (!acceptedAvatarTypes.has(file.type)) {
    throw new Error('Avatar must be a JPG, PNG, or WEBP image.');
  }

  const src = await readFileAsDataUrl(file);
  const image = await loadImage(src);
  const canvas = document.createElement('canvas');
  canvas.width = avatarOutputSize;
  canvas.height = avatarOutputSize;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Failed to prepare avatar image.');
  }

  const sourceSize = Math.min(image.naturalWidth, image.naturalHeight);
  const sourceX = (image.naturalWidth - sourceSize) / 2;
  const sourceY = (image.naturalHeight - sourceSize) / 2;

  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceSize,
    sourceSize,
    0,
    0,
    avatarOutputSize,
    avatarOutputSize,
  );

  const blob = await new Promise<Blob | null>(resolve =>
    canvas.toBlob(resolve, 'image/webp', 0.9),
  );

  if (!blob) {
    throw new Error('Failed to create avatar image.');
  }

  return new File([blob], 'avatar.webp', { type: 'image/webp' });
};

const EditAgentPage = () => {
  const params = useParams<{ id: string }>();
  const { id } = params;

  const { data: agent, error: fetchError, isPending: isFetchPending } = useFetchAgentById(id);
  const updateAgentMutation = useUpdateAgentById(id);
  const updateAvatarMutation = useUpdateAgentAvatarById(id);
  const { mutate: deleteAgent } = useDeleteAgentById(id);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [showVisibilityDialog, setShowVisibilityDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [originalValues, setOriginalValues] = useState<AgentFormValues | null>(null);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const form = useForm<AgentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      visibility: 'private',
      interactionMode: 'assistant',
      name: '',
      description: '',
      showDetails: false,
      systemPrompt: '',
    },
  });
  const { reset } = form;

  const currentValues = normalizeAgentFormValues(form.watch(), originalValues);
  const hasFormChanges = originalValues
    ? JSON.stringify(currentValues) !== JSON.stringify(originalValues)
    : false;
  const hasAvatarChanges = !!selectedAvatarFile;
  const hasChanges = hasFormChanges || hasAvatarChanges;
  const isSavePending = updateAgentMutation.isPending || updateAvatarMutation.isPending;
  const isFieldDirty = (field: keyof AgentFormValues) =>
    originalValues ? currentValues[field] !== originalValues[field] : false;

  useEffect(() => {
    if (agent) {
      const values = getAgentFormValues(agent);
      reset(values);
      setOriginalValues(values);
    }
  }, [agent, reset]);

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
    };
  }, [avatarPreviewUrl]);

  const clearSelectedAvatar = () => {
    setSelectedAvatarFile(null);
    if (avatarPreviewUrl) {
      URL.revokeObjectURL(avatarPreviewUrl);
    }
    setAvatarPreviewUrl(null);
  };

  const onSubmit = async (values: AgentFormValues) => {
    setSaveError(null);

    try {
      const normalizedValues = normalizeAgentFormValues(values, originalValues);
      let savedAgent: Agent | null = null;

      if (hasFormChanges) {
        savedAgent = await updateAgentMutation.mutateAsync(normalizedValues);
      }

      if (selectedAvatarFile) {
        savedAgent = await updateAvatarMutation.mutateAsync(selectedAvatarFile);
        clearSelectedAvatar();
      }

      if (savedAgent) {
        const savedValues = getAgentFormValues(savedAgent);
        reset(savedValues);
        setOriginalValues(savedValues);
      }
    }
    catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save changes.');
    }
  };

  const onRevert = () => {
    if (originalValues) {
      reset(originalValues);
    }
    clearSelectedAvatar();
    setSaveError(null);
  };

  const handleAvatarFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    setSaveError(null);

    try {
      const avatarFile = await createWebpAvatarFile(file);
      const previewUrl = URL.createObjectURL(avatarFile);

      setSelectedAvatarFile(avatarFile);
      setAvatarPreviewUrl((currentUrl) => {
        if (currentUrl) {
          URL.revokeObjectURL(currentUrl);
        }

        return previewUrl;
      });
    }
    catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to prepare avatar image.');
    }
  };

  const handleVisibilityChange = () => {
    const newVisibility = agent?.visibility === 'private' ? 'public' : 'private';
    updateAgentMutation.mutate({
      visibility: newVisibility,
      interactionMode: parseAgentInteractionMode(agent?.interactionMode),
      name: agent?.name || '',
      description: agent?.description || '',
      showDetails: agent?.showDetails ?? false,
      systemPrompt: agent?.systemPrompt || '',
    });
    setShowVisibilityDialog(false);
  };

  if (agent && !agent.isOwn) {
    return <NextError statusCode={404} />;
  }

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
      <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-12 overflow-clip overscroll-y-auto">
        <Card className="relative size-fit sm:px-4 max-w-2xl w-full bg-card/80">
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
                <div className="relative mr-4 sm:mr-8 size-24 shrink-0">
                  <Avatar className="size-24 rounded-full">
                    <AvatarImage src={avatarPreviewUrl || getAgentAvatarUrl(agent?.id, agent?.updatedAt)} alt={agent?.name} className="object-cover" />
                    <AvatarFallback className="rounded-lg bg-gradient-to-br from-emerald-600 to-purple-600 cursor-default">
                      <Bot size="48" className="text-white" />
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    aria-label="Change avatar"
                    type="button"
                    size="icon"
                    variant="secondary"
                    disabled={isSavePending}
                    className="absolute bottom-0 right-0 size-8 rounded-full border border-border shadow-sm"
                    onClick={() => avatarInputRef.current?.click()}
                  >
                    {isSavePending
                      ? <LoaderCircle className="animate-spin" />
                      : <Camera />}
                  </Button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    disabled={isSavePending}
                    onChange={handleAvatarFileChange}
                  />
                </div>
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
                            disabled={isSavePending || hasChanges}
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
                            disabled={isSavePending || hasChanges}
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
                  {saveError
                    && (
                      <Alert variant="destructive">
                        <AlertDescription>{saveError}</AlertDescription>
                      </Alert>
                    )}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="sm:flex items-baseline">
                        <FormLabel className="w-30 text-md">
                          Name
                          {isFieldDirty('name') && '*'}
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
                      <FormItem className="sm:flex items-baseline">
                        <FormLabel className="w-30 text-md">
                          Description
                          {isFieldDirty('description') && '*'}
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
                    name="interactionMode"
                    render={({ field }) => (
                      <FormItem className="sm:flex items-baseline">
                        <FormLabel className="w-30 text-md">
                          Mode
                          {isFieldDirty('interactionMode') && '*'}
                        </FormLabel>
                        <div className="flex-1">
                          <Select
                            onValueChange={field.onChange}
                            value={parseAgentInteractionMode(field.value, originalValues?.interactionMode)}
                            disabled={isSavePending}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="assistant">Assistant</SelectItem>
                              <SelectItem value="participant">Participant</SelectItem>
                            </SelectContent>
                          </Select>
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
                            {isFieldDirty('showDetails') && '*'}
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
                      <FormItem className="sm:flex items-baseline">
                        <FormLabel className="w-30 text-md">
                          System Prompt
                          {isFieldDirty('systemPrompt') && '*'}
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
                    disabled={isSavePending}
                    className="w-30 text-red-500"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    Delete
                  </Button>
                </div>
                <div className="flex gap-3">
                  <div className="hidden sm:block">
                    <Button
                      variant="secondary"
                      type="button"
                      disabled={isSavePending || !hasChanges}
                      className="w-30"
                      onClick={onRevert}
                    >
                      Revert
                    </Button>
                  </div>
                  <div>
                    <Button
                      type="submit"
                      disabled={isSavePending || !hasChanges}
                      className="w-30"
                    >
                      {isSavePending ? 'Saving...' : 'Save Changes'}
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
