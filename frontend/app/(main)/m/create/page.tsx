'use client'

import { useForm } from 'react-hook-form'
import { useCreateModel } from '@/hooks/use-models'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const formSchema = z.object({
  visibility: z.enum(['private', 'public']),
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  llmModel: z.string().min(1, 'LLM Model is required').max(100, 'LLM Model is too long'),
  endpointUrl: z.string().url('Must be a valid URL'),
  apiKey: z.string().min(1, 'API Key is required'),
})

const CreateModelPage = () => {
  const { mutate, isPending } = useCreateModel()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      visibility: 'private',
      name: '',
      llmModel: '',
      endpointUrl: '',
      apiKey: '',
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutate(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6 h-screen flex'>
        <div className='max-w-2xl m-auto w-full space-y-5 px-10'>
          <div className='items-center justify-center relative space-y-10'>
            <div className="absolute left-1/8 top-2/3 -translate-x-1/2 -translate-y-1/2 size-50 bg-red-500 rounded-full -z-10 blur-3xl opacity-30" />
            <div className="absolute left-0 top-1/3 -translate-x-1/2 -translate-y-1/2 size-30 bg-blue-500 rounded-full -z-10 blur-3xl opacity-50" />

            <div className='text-center text-4xl font-bold space-x-3 cursor-default'>
              Create new model
            </div>

            <div className='space-y-2'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem className='flex items-baseline'>
                    <FormLabel className='w-30 text-md'>Name</FormLabel>
                    <div className='flex-1'>
                      <FormControl>
                        <Input placeholder='Your model name' {...field} />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='llmModel'
                render={({ field }) => (
                  <FormItem className='flex items-baseline'>
                    <FormLabel className='w-30 text-md'>LLM Model</FormLabel>
                    <div className='flex-1'>
                      <FormControl>
                        <Input placeholder='gpt-4o' {...field} />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='endpointUrl'
                render={({ field }) => (
                  <FormItem className='flex items-baseline'>
                    <FormLabel className='w-30 text-md'>Endpoint URL</FormLabel>
                    <div className='flex-1'>
                      <FormControl>
                        <Input placeholder='https://api.openai.com/v1' {...field} />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='apiKey'
                render={({ field }) => (
                  <FormItem className='flex items-baseline'>
                    <FormLabel className='w-30 text-md'>API Key</FormLabel>
                    <div className='flex-1'>
                      <FormControl>
                        <Input
                          type='password'
                          placeholder='sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
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

          <div className='flex justify-end'>
            <Button type='submit' disabled={isPending} className='w-30'>
              {isPending ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}

export default CreateModelPage