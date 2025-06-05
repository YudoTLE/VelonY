import { getContext } from '../lib/async-local-storage.js'

export default function MessageService({ repo, io }) {
  return {
    async delete(messageId) {
      const { user } = getContext()

      if (!user) throw { status: 401, message: 'Unauthorized' }
      
      const [message, participants] = await Promise.all([
        repo.message.delete(messageId),
        repo.user.listForConversation(message.conversationId)
      ])

      for (const participant of participants) {
        io.of('/users').to(participant.id).emit('remove-message', message)
      }

      return message
    },
  }
}