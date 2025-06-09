'use client';

import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useFetchModelById, useUpdateModelById } from '@/hooks/use-models';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';

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

import { X, Plus, LoaderCircle } from 'lucide-react';

const formSchema = z.object({
  visibility: z.enum(['private', 'public', 'default']),
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  description: z.string(),
  llmModel: z.string().min(1, 'LLM Model is required').max(100, 'LLM Model is too long'),
  endpointUrl: z.string().url('Must be a valid URL'),
  apiKey: z.string().min(1, 'API Key is required'),
  preset: z.string(),
  config: z.array(z.object({
    type: z.enum(['string', 'float', 'integer', 'boolean']),
    name: z.string().min(1),
    value: z.union([z.string(), z.number(), z.boolean()]),
  })),
});

type ModelConfigField = {
  type: 'string' | 'float' | 'integer' | 'boolean'
  name: string
  value: string | number | boolean
};

type ModelFieldType = 'string' | 'float' | 'integer' | 'boolean';

const EditModelPage = () => {
  const params = useParams<{ id: string }>();
  const { id } = params;

  const { data: model, error: fetchError, isPending: isFetchPending } = useFetchModelById(id);
  const { mutate: updateModel, isPending: isUpdatePending } = useUpdateModelById(id);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      visibility: 'private',
      name: '',
      description: '',
      llmModel: '',
      endpointUrl: '',
      apiKey: '',
      preset: 'Other',
      config: [],
    },
  });

  useEffect(() => {
    if (model) {
      form.reset({
        visibility: model.visibility || 'private',
        name: model.name || '',
        description: model.description || '',
        llmModel: model.llmModel || '',
        endpointUrl: model.endpointUrl || '',
        apiKey: model.apiKey || '',
        preset: model.preset || 'Other',
        config: model.config || [],
      });
    }
  }, [model, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log('FORM VALUES', values);
    updateModel(values);
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
    <div className="flex flex-col justify-center items-center gap-5 overscroll-y-auto">
      <Card className="relative size-fit mx-4 my-16 px-8 max-w-2xl w-full bg-card/80">
        <div className="absolute -top-6 -left-6 size-32 bg-yellow-400 rounded-full -z-10 blur-xl opacity-50" />
        <div className="absolute -top-12 -left-12 size-64 bg-orange-500 rounded-full -z-10 blur-2xl opacity-40" />
        <div className="absolute -top-20 -left-20 size-128 bg-red-500 rounded-full -z-10 blur-3xl opacity-30" />
        <div className="absolute -bottom-6 -right-6 size-32 bg-cyan-400 rounded-full -z-10 blur-xl opacity-60" />
        <div className="absolute -bottom-12 -right-12 size-64 bg-blue-500 rounded-full -z-10 blur-2xl opacity-40" />
        <div className="absolute -bottom-20 -right-20 size-128 bg-purple-600 rounded-full -z-10 blur-3xl opacity-30" />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <CardHeader className="text-center text-4xl font-bold">
              Edit Model
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
                          <FormLabel className="w-30 text-md">Description</FormLabel>
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
                      name="llmModel"
                      render={({ field }) => (
                        <FormItem className="flex items-baseline">
                          <FormLabel className="w-30 text-md">LLM Model</FormLabel>
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
                      name="endpointUrl"
                      render={({ field }) => (
                        <FormItem className="flex items-baseline">
                          <FormLabel className="w-30 text-md">Endpoint URL</FormLabel>
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
                          <FormLabel className="w-30 text-md">API Key</FormLabel>
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
                      <FormLabel className="w-32 flex-shrink-0 text-md">Config</FormLabel>
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
  );
};

export default EditModelPage;
