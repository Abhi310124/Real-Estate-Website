'use client'
import { useEffect, useState } from 'react'

export function useReducedMotion(): boolean {
  // Start true so the very first paint is the safe, fully-visible state.
  const [reduced, setReduced] = useState(true)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  return reduced
}
