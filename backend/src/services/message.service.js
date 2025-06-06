import { getContext } from '../lib/async-local-storage.js'

export default function MessageService({ repo, io }) {
  return {
    async delete(messageId) {
      const { user } = getContext()

      if (!user) throw { status: 401, message: 'Unauthenticated' }
      
      const message = await repo.message.delete(messageId)
      const participants = await repo.user.listForConversation(message.conversationId)
      
      for (const participant of participants) {
        io.of('/users').to(participant.id).emit('remove-message', message)
      }

      return message
    },
  }
}