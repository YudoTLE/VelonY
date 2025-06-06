import { getContext } from '../lib/async-local-storage.js'

export default function UserService({ repo }) {
  return {
    async getMe() {
      const { user } = getContext()

      if (!user) throw { status: 401, message: 'Unauthenticated' }
      return await repo.user.get(user.sub)
    },
  }
}