'use client'

import { useState, useEffect } from 'react'

export function PerformanceIndicator() {
  const [fps, setFps] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return

    let frameCount = 0
    let lastTime = performance.now()
    let animationId: number

    const measureFPS = () => {
      const currentTime = performance.now()
      frameCount++
      
      if (currentTime >= lastTime + 1000) {
        const currentFps = Math.round((frameCount * 1000) / (currentTime - lastTime))
        setFps(currentFps)
        frameCount = 0
        lastTime = currentTime
      }
      
      animationId = requestAnimationFrame(measureFPS)
    }

    // Show/hide with Ctrl+Shift+P
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(!isVisible)
      }
    }

    measureFPS()
    window.addEventListener('keydown', handleKeyPress)
    
    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [isVisible])

  if (process.env.NODE_ENV !== 'development' || !isVisible) return null

  const getColor = () => {
    if (fps >= 55) return 'text-green-400 bg-green-400/10'
    if (fps >= 45) return 'text-yellow-400 bg-yellow-400/10'
    return 'text-red-400 bg-red-400/10'
  }

  return (
    <div className={`fixed top-20 right-4 z-[9999] px-3 py-2 rounded-lg backdrop-blur-sm border ${getColor()}`}>
      <div className="text-xs font-mono">
        <div>FPS: {fps}</div>
        <div className="text-[10px] opacity-70">
          {fps >= 55 ? 'Excellent' : fps >= 45 ? 'Good' : 'Poor'}
        </div>
      </div>
    </div>
  )
}