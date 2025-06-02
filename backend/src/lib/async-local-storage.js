import { AsyncLocalStorage } from 'async_hooks'

const asyncLocalStorage = new AsyncLocalStorage()

export function getContext() {
  return asyncLocalStorage.getStore() || {}
}

export default asyncLocalStorage