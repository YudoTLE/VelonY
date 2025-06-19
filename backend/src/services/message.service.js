import { getContext } from '../lib/async-local-storage.js'

export default function MessageService({ repo, realtime }) {
  return {
    async delete(messageId) {
      const { user } = getContext()

      if (!user) throw { status: 401, message: 'Unauthenticated' }
      
      const [message] = await repo.message.delete({ messageId })
      const participants = await repo.conversationParticipant.select({ conversationId: message.conversationId })
    
      const enrichedMessage = {
        ...message,
        senderName: '',
        senderAvatar: '',
        status: 'deleted',
      }

      for (const participant of participants) {
        realtime.emit('users', participant.userId, 'remove-message', enrichedMessage)
      }
    
      return enrichedMessage
    },
  }
}
