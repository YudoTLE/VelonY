import { useRef, useCallback } from 'react'

export const useAutosizeTextarea = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const resize = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [])

  return { textareaRef, resize }
}
