import { useRef, useCallback, useEffect } from 'react'

export function useAutoSave(saveFn, delay = 1000) {
  const timer = useRef(null)

  const cancel = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  // Clear timer on unmount to prevent ghost saves after navigation
  useEffect(() => () => cancel(), [cancel])

  const trigger = useCallback(() => {
    cancel()
    timer.current = setTimeout(() => saveFn(), delay)
  }, [saveFn, delay, cancel])

  return [trigger, cancel]
}
