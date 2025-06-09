import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogIn } from 'lucide-react';
import { Form, FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';

import { useForm } from 'react-hook-form';

import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import api from '@/lib/axios'; // adjust if needed

const formSchema = z.object({
  conversationId: z.string().uuid('Must be a valid UUID'),
});

export function JoinConversationDialog() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      conversationId: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await api.post(`/conversations/${values.conversationId}/participants/self`);
    }
    catch (err) {
      console.error(err);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="xs" variant="secondary" className="align-baseline flex-1 rounded-full">
          <LogIn />
          Join
        </Button>
      </DialogTrigger>

      <DialogContent className="w-sm">
        <DialogHeader>
          <DialogTitle>Join Conversation</DialogTitle>
          <DialogDescription>
            Enter the conversation ID to join.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="conversationId"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-4">
              <DialogClose asChild>
                <Button type="button" variant="secondary" className="flex-1">
                  Cancel
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button type="submit" className="flex-1">Join</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
