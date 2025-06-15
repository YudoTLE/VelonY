'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useFetchModelById, useUpdateModelById, useDeleteModelById } from '@/hooks/use-models';
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

import { X, Plus, LoaderCircle, Cpu } from 'lucide-react';

const formSchema = z.object({
  visibility: z.enum(['private', 'public', 'default']),
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  description: z.string(),
  showDetails: z.boolean(),
  llm: z.string().min(1, 'LLM Model is required').max(100, 'LLM Model is too long'),
  endpoint: z.string().url('Must be a valid URL'),
  apiKey: z.string().min(1, 'API Key is required'),
  config: z.array(z.object({
    type: z.enum(['string', 'float', 'integer', 'boolean']),
    name: z.string().min(1),
    value: z.union([z.string(), z.number(), z.boolean()]),
  })),
});

const EditModelPage = () => {
  const params = useParams<{ id: string }>();
  const { id } = params;

  const { data: model, error: fetchError, isPending: isFetchPending } = useFetchModelById(id);
  const { mutate: updateModel, isPending: isUpdatePending } = useUpdateModelById(id);
  const { mutate: deleteModel } = useDeleteModelById(id);

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
      llm: '',
      endpoint: '',
      apiKey: '',
      config: [],
    },
  });

  const currentValues = form.watch();
  const hasChanges = originalValues && JSON.stringify(currentValues) !== JSON.stringify(originalValues);
  const { formState: { dirtyFields } } = form;

  useEffect(() => {
    if (model) {
      const values = {
        visibility: model.visibility || 'private',
        name: model.name || '',
        description: model.description || '',
        showDetails: model.showDetails,
        llm: model.llm || '',
        endpoint: model.endpoint || '',
        apiKey: model.apiKey || '',
        config: model.config || [],
      };
      form.reset(values);
      setOriginalValues(values);
    }
  }, [model, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    updateModel(values);
  };

  const onRevert = () => {
    if (originalValues) {
      form.reset(originalValues);
    }
  };

  const onConfigFieldPush = (configField: ModelConfigField) => {
    form.setValue('config', [...form.getValues('config'), configField]);
  };

  const onConfigFieldRemove = (index: number) => {
    const currentValue = form.getValues('config');
    form.setValue('config', currentValue.filter((_, i) => i !== index));
  };

  const renderValueInput = (field: ModelConfigField, index: number) => {
    const updateValue = (newValue: string | number | boolean) => {
      const newConfigField = [...form.getValues('config')];
      newConfigField[index].value = newValue;
      form.setValue('config', newConfigField);
    };

    switch (field.type) {
      case 'string':
        return (
          <Input
            value={field.value as string}
            onChange={e => updateValue(e.target.value)}
            placeholder="Enter value"
          />
        );

      case 'float':
      case 'integer':
        return (
          <Input
            type="number"
            step={field.type === 'float' ? 'any' : '1'}
            value={field.value as number}
            onChange={(e) => {
              const val = field.type === 'float'
                ? parseFloat(e.target.value)
                : parseInt(e.target.value);
              updateValue(isNaN(val) ? 0 : val);
            }}
            placeholder="Enter number"
          />
        );

      case 'boolean':
        return (
          <Select
            value={String(field.value)}
            onValueChange={value => updateValue(value === 'true')}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select value" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">True</SelectItem>
              <SelectItem value="false">False</SelectItem>
            </SelectContent>
          </Select>
        );

      default:
        return null;
    }
  };

  const handleVisibilityChange = () => {
    const newVisibility = model?.visibility === 'private' ? 'public' : 'private';
    updateModel({
      visibility: newVisibility,
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
      <div className="flex-1 flex flex-col justify-center items-center gap-5 overscroll-y-auto">
        <Card className="relative size-fit m-4 px-8 max-w-2xl w-full bg-card/80">
          <div className="absolute -top-6 -left-6 size-32 bg-yellow-400 rounded-full -z-10 blur-xl opacity-25" />
          <div className="absolute -top-12 -left-12 size-64 bg-orange-500 rounded-full -z-10 blur-2xl opacity-20" />
          <div className="absolute -top-20 -left-20 size-128 bg-red-500 rounded-full -z-10 blur-3xl opacity-15" />
          <div className="absolute -bottom-6 -right-6 size-32 bg-cyan-400 rounded-full -z-10 blur-xl opacity-25" />
          <div className="absolute -bottom-12 -right-12 size-64 bg-blue-500 rounded-full -z-10 blur-2xl opacity-20" />
          <div className="absolute -bottom-20 -right-20 size-128 bg-purple-600 rounded-full -z-10 blur-3xl opacity-15" />

          <Button
            asChild
            variant="link"
            className="absolute top-0 right-0 text-blue-400 font-normal"
          >
            <Link href={model?.url}>
              view
            </Link>
          </Button>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <CardHeader className="flex">
                {model?.visibility === 'default'
                  ? (
                      <Avatar className="size-15 mr-4 rounded-full">
                        <AvatarFallback className="rounded-lg bg-gradient-to-br from-orange-500 to-blue-500 cursor-default">
                          <Cpu size="30" className="text-white" />
                        </AvatarFallback>
                      </Avatar>
                    )
                  : (
                      <Avatar className="size-24 mr-8 rounded-full">
                        <AvatarFallback className="rounded-lg bg-gradient-to-br from-orange-500 to-blue-500 cursor-default">
                          <Cpu size="48" className="text-white" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                <div className="">
                  <div className="text-2xl font-bold">
                    {model?.name}
                  </div>
                  <div>
                    {model?.visibility === 'private'
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
                    {model?.visibility === 'public'
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
                    {model?.visibility === 'default'
                      && (
                        <Badge className="bg-secondary cursor-default border-border">
                          <span className="bg-yellow-400 aspect-square h-2 w-2" />
                          default
                        </Badge>
                      )}

                  </div>
                  <div className="flex gap-5 mt-2">
                    {model?.visibility !== 'default'
                      && (
                        <div>
                          <span>
                            {model?.subscriberCount}
                          </span>
                          <span className="text-muted-foreground"> subscribers</span>
                        </div>
                      )}
                  </div>
                </div>
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
                            <FormLabel className="w-30 text-md">
                              Name
                              {dirtyFields.name && '*'}
                            </FormLabel>
                            <div className="flex-1">
                              <FormControl>
                                <Input placeholder="Chat VelonY" {...field} />
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
                                  placeholder="Best LLM in the world."
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
                        name="llm"
                        render={({ field }) => (
                          <FormItem className="flex items-baseline">
                            <FormLabel className="w-30 text-md">
                              Model
                              {dirtyFields.llm && '*'}
                            </FormLabel>
                            <div className="flex-1">
                              <FormControl>
                                <Input placeholder="gpt-4o" {...field} />
                              </FormControl>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="endpoint"
                        render={({ field }) => (
                          <FormItem className="flex items-baseline">
                            <FormLabel className="w-30 text-md">
                              Endpoint
                              {dirtyFields.endpoint && '*'}
                            </FormLabel>
                            <div className="flex-1">
                              <FormControl>
                                <Input placeholder="https://api.openai.com/v1" {...field} />
                              </FormControl>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="apiKey"
                        render={({ field }) => (
                          <FormItem className="flex items-baseline">
                            <FormLabel className="w-30 text-md">
                              API Key
                              {dirtyFields.apiKey && '*'}
                            </FormLabel>
                            <div className="flex-1">
                              <FormControl>
                                <Input type="password" placeholder="sk-..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />

                      <div className="flex items-baseline">
                        <FormLabel className="w-32 flex-shrink-0 text-md">
                          Config
                          {dirtyFields.config && '*'}
                        </FormLabel>
                        <div className="flex flex-col flex-1 gap-2">
                          {form.watch('config').map((field, index) => (
                            <div key={index} className="flex items-center gap-1">
                              <div className="flex">
                                <Input
                                  className="w-30 flex-shrink-0 rounded-r-none focus-within:z-10"
                                  value={field.name}
                                  onChange={(e) => {
                                    const newConfigField = [...form.getValues('config')];
                                    newConfigField[index].name = e.target.value;
                                    form.setValue('config', newConfigField);
                                  }}
                                  placeholder="Field name"
                                />
                                <Select
                                  value={field.type}
                                  onValueChange={(value: ModelFieldType) => {
                                    const newConfigField = [...form.getValues('config')];
                                    newConfigField[index].type = value;
                                    newConfigField[index].value = value === 'boolean' ? false : value === 'string' ? '' : 0;
                                    form.setValue('config', newConfigField);
                                  }}
                                >
                                  <SelectTrigger className="w-25 flex-shrink-0 rounded-l-none">
                                    <SelectValue placeholder="Field type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="string">String</SelectItem>
                                    <SelectItem value="float">Float</SelectItem>
                                    <SelectItem value="integer">Integer</SelectItem>
                                    <SelectItem value="boolean">Boolean</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              {renderValueInput(field, index)}
                              <Button
                                type="button"
                                onClick={() => onConfigFieldRemove(index)}
                                variant="ghost"
                                size="xs"
                              >
                                <X />
                              </Button>
                            </div>
                          ))}
                          <div className="flex">
                            <div>
                              <Button
                                className="bg-inherit"
                                variant="outline"
                                type="button"
                                onClick={() => onConfigFieldPush({
                                  type: 'string',
                                  name: '',
                                  value: '',
                                })}
                              >
                                <Plus />
                                Add Field
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
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
              {model?.name}
              {' '}
              {model?.visibility === 'private' ? 'public' : 'private'}
              ?
            </AlertDialogTitle>
            <div className="space-y-4">
              {model?.visibility === 'private'
                ? (
                    <>
                      <Alert variant="destructive">
                        <AlertDescription>
                          <strong>WARNING: This will make your model discoverable to everyone.</strong>
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-2">
                        <p>Once public, anyone will be able to:</p>
                        <ul className="list-disc ml-6 space-y-1">
                          <li>See your model&apos;s name and description in marketplace searches</li>
                          <li>Subscribe and use your model</li>
                          <li>Generate responses using your model</li>
                          <li>Share links to your model publicly</li>
                        </ul>
                      </div>
                    </>
                  )
                : (
                    <>
                      <Alert variant="destructive">
                        <AlertDescription>
                          <strong>WARNING: This will permanently remove ALL subscribers from your model.</strong>
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-2">
                        <p>This action will:</p>
                        <ul className="list-disc ml-6 space-y-1">
                          <li>Remove all current subscribers immediately</li>
                          <li>Users will lose access to this model</li>
                          <li>Make your model undiscoverable in the marketplace</li>
                          <li>Break all existing public links</li>
                        </ul>
                      </div>

                      <Alert>
                        <AlertDescription>
                          <strong>This action cannot be undone.</strong>
                          {' '}
                          If you make this model public again later, you will have zero subscribers. All previous subscribers will be permanently lost.
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
              Make this model
              {' '}
              {model?.visibility === 'private' ? 'public' : 'private'}
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
              {model?.name}
              ?
            </AlertDialogTitle>
            <div className="space-y-4">

              <Alert variant="destructive">
                <AlertDescription>
                  <strong>WARNING: This model will be permanently deleted and cannot be recovered.</strong>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <p>This action will:</p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Permanently delete this model</li>
                  <li>Make the model completely inaccessible to all users</li>
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
              onClick={() => deleteModel()}
            >
              Delete this model
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EditModelPage;
