import { getContext } from '../lib/async-local-storage.js'

export default function MessageService({ repo, realtime }) {
  return {
    async update(messageId, payload = {}) {
      const { user } = getContext()

      if (!user) throw { status: 401, message: 'Unauthenticated' }

      const content = typeof payload.content === 'string' ? payload.content : undefined
      if (content == null) throw { status: 400, message: 'Message content is required' }
      if (!content.trim()) throw { status: 400, message: 'Message content cannot be empty' }

      const [existingMessage] = await repo.message.select({ messageId })
      if (!existingMessage) throw { status: 404, message: 'Message not found' }
      if (existingMessage.senderId !== user.sub) throw { status: 403, message: 'You can only edit your own messages' }
      if (existingMessage.type !== 'user') throw { status: 400, message: 'Only user messages can be edited' }

      const [[message], participants] = await Promise.all([
        repo.message.update({ messageId }, {
          content,
          updatedAt: new Date(),
        }),
        repo.conversationParticipant.select({ conversationId: existingMessage.conversationId }),
      ])

      const users = await repo.user.select({ userIds: [message.senderId] })
      const userMap = new Map(users.map(user => [user.id, user]))

      const enrichedMessage = {
        ...message,
        senderName: userMap.get(message.senderId)?.name ?? null,
        senderAvatar: userMap.get(message.senderId)?.avatar ?? null,
        status: 'sent',
      }

      for (const participant of participants) {
        realtime.emit('users', participant.userId, 'receive-message', enrichedMessage)
      }

      return enrichedMessage
    },

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
