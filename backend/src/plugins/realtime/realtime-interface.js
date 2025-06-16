export class RealtimeInterface {
  async emit(namespace, channel, event, data) {
    throw new Error('emit must be implemented')
  }

  async cleanup() {
    // Optional cleanup - default empty implementation
  }
}