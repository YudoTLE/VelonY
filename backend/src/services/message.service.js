import { getContext } from '../lib/async-local-storage.js'

export default function MessageService({ repo, io }) {
  return {
    async delete(messageId) {
      const { user } = getContext()

      if (!user) throw { status: 401, message: 'Unauthenticated' }
      
      const [message] = await repo.message.delete({ messageId })
      const participants = await repo.conversationParticipant.select({ conversationId: message.conversationId })

      const userIds = participants.map(p => p.userId)
      const users = await repo.user.select({ userIds })
    
      const userMap = new Map(users.map(u => [u.id, u]))
    
      const enrichedMessage = {
        ...message,
        senderName: userMap.get(message.senderId)?.name,
        senderAvatar: userMap.get(message.senderId)?.avatarUrl,
      }

      for (const participant of participants) {
        io.of('/users').to(participant.userId).emit('remove-message', enrichedMessage)
      }
    
      return enrichedMessage
    },
  }
}
