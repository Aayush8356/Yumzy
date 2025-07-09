'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ImageManager, ImageUrls } from '@/lib/image-manager'
import { getFallbackImageForItem, generatePlaceholderImage } from '@/data/fallback-images'

interface OptimizedFoodImageProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  professionalCategories?: string[]
  priority?: boolean
  fill?: boolean
  quality?: number
}

export function OptimizedFoodImage({
  src,
  alt,
  width,
  height,
  className = '',
  professionalCategories = [],
  priority = false,
  fill = false,
  quality = 85
}: OptimizedFoodImageProps) {
  const [imageSrc, setImageSrc] = useState(src)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [fallbackLevel, setFallbackLevel] = useState(0)

  // Get fallback sources in order of preference
  const fallbackSources = [
    src, // Original
    ImageUrls.generateUnsplashFood(professionalCategories[0] || 'default', width, height), // Unsplash
    getFallbackImageForItem(professionalCategories), // Category-specific fallback
    generatePlaceholderImage(professionalCategories[0] || 'default', width, height) // Placeholder
  ]

  useEffect(() => {
    setImageSrc(src)
    setFallbackLevel(0)
    setHasError(false)
    setIsLoading(true)
  }, [src])

  const handleError = () => {
    const nextLevel = fallbackLevel + 1
    if (nextLevel < fallbackSources.length) {
      setFallbackLevel(nextLevel)
      setImageSrc(fallbackSources[nextLevel])
    } else {
      setHasError(true)
      setIsLoading(false)
    }
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  const imageProps = {
    src: imageSrc,
    alt,
    onError: handleError,
    onLoad: handleLoad,
    className: `${className} transition-all duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`,
    priority,
    quality
  }

  return (
    <div className={`relative ${!fill ? `w-[${width}px] h-[${height}px]` : ''} bg-gray-100 rounded-lg overflow-hidden`}>
      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse" 
               style={{ animation: 'shimmer 2s infinite' }}></div>
        </div>
      )}

      {/* Image */}
      {fill ? (
        <Image
          {...imageProps}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      ) : (
        <Image
          {...imageProps}
          width={width}
          height={height}
        />
      )}

      {/* Error/fallback indicator */}
      {fallbackLevel > 0 && (
        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          {fallbackLevel === 1 && '📷'}
          {fallbackLevel === 2 && '🖼️'}
          {fallbackLevel === 3 && '🎨'}
        </div>
      )}
    </div>
  )
}

export default OptimizedFoodImage