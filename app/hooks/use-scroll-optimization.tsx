"use client"

import { useEffect, useState } from 'react'

export function useScrollOptimization() {
  const [isScrolling, setIsScrolling] = useState(false)
  const [scrollTimeout, setScrollTimeout] = useState<NodeJS.Timeout>()

  useEffect(() => {
    const handleScroll = () => {
      // Clear existing timeout
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }

      // Set scrolling state
      if (!isScrolling) {
        setIsScrolling(true)
        // Disable heavy animations during scroll
        document.body.style.setProperty('--animation-play-state', 'paused')
      }

      // Set new timeout to detect scroll end
      const newTimeout = setTimeout(() => {
        setIsScrolling(false)
        // Re-enable animations after scroll ends
        document.body.style.setProperty('--animation-play-state', 'running')
      }, 150)

      setScrollTimeout(newTimeout)
    }

    // Add scroll listener with passive flag for better performance
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }
    }
  }, [isScrolling, scrollTimeout])

  return { isScrolling }
}

// Utility to reduce motion during scroll
export function useReducedMotionDuringScroll() {
  const { isScrolling } = useScrollOptimization()
  
  return {
    transition: isScrolling 
      ? { duration: 0.1 } 
      : { duration: 0.6, ease: "easeOut" },
    animate: !isScrolling
  }
}