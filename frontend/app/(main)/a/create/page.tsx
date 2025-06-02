'use client'

import { useForm } from 'react-hook-form'
import { useCreateAgent } from '@/hooks/use-agents'
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
import { TextareaAutosize } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'

const formSchema = z.object({
  visibility: z.enum(['private', 'public']),
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  systemPrompt: z.string(),
  temperature: z.coerce.number().gte(0).lte(2),
})

const CreateAgentPage = () => {
  const { mutate, isPending } = useCreateAgent()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      visibility: 'private',
      name: '',
      systemPrompt: '',
      temperature: 0.7,
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
            <div className="absolute left-0 top-2/3 -translate-x-1/2 -translate-y-1/2 size-40 bg-red-500 rounded-full -z-10 blur-3xl opacity-40" />
            <div className="absolute left-1/7 top-1/3 -translate-x-1/2 -translate-y-1/2 size-40 bg-blue-500 rounded-full -z-10 blur-3xl opacity-40" />

            <div className='text-center text-4xl font-bold space-x-3 cursor-default'>
              Create new agent
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
                        <Input placeholder='Your agent name' {...field} />
                      </FormControl>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='systemPrompt'
                render={({ field }) => (
                  <FormItem className='flex items-baseline'>
                    <FormLabel className='w-30 text-md'>System Prompt</FormLabel>
                    <div className='flex-1'>
                      <FormControl>
                        <TextareaAutosize
                          placeholder='You are a helpful assistant.'
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
                name='temperature'
                render={({ field }) => (
                  <FormItem className='flex items-baseline'>
                    <FormLabel className='w-30 text-md'>Temperature</FormLabel>
                    <div className='flex-1'>
                      <FormControl>
                        <Input placeholder='' {...field} />
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

export default CreateAgentPage