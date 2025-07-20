'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { fallbackImages, generatePlaceholderImage, getFallbackImageForItem } from '@/data/fallback-images'

interface ProfessionalFoodImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  professionalCategories?: string[]
  priority?: boolean
  fill?: boolean
}

export function ProfessionalFoodImage({ 
  src, 
  alt, 
  width = 300, 
  height = 200,
  className = '',
  professionalCategories = [],
  priority = false,
  fill = false
}: ProfessionalFoodImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  
  // Generate placeholder based on categories
  const placeholderSrc = professionalCategories.length > 0 
    ? generatePlaceholderImage(professionalCategories[0], width, height)
    : generatePlaceholderImage('default', width, height)
  
  // Get fallback image based on categories
  const fallbackSrc = getFallbackImageForItem(professionalCategories)
  
  useEffect(() => {
    // If src is empty or invalid, immediately use fallback
    if (!src || src.trim() === '') {
      setCurrentSrc(fallbackSrc)
      setHasError(false)
      setIsLoading(false) // Don't show loading for immediate fallback
    } else {
      setCurrentSrc(src)
      setHasError(false)
      setIsLoading(true)
    }
  }, [src, fallbackSrc])
  
  const handleError = () => {
    setHasError(true)
    setIsLoading(false)
    
    // Try fallback image first
    if (currentSrc === src) {
      setCurrentSrc(fallbackSrc)
    } else if (currentSrc === fallbackSrc) {
      // If fallback also fails, use placeholder
      setCurrentSrc(placeholderSrc)
    }
  }
  
  const handleLoad = () => {
    setIsLoading(false)
  }
  
  const imageProps = {
    src: currentSrc,
    alt,
    onError: handleError,
    onLoad: handleLoad,
    className: `${className} transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`,
    priority
  }
  
  return (
    <div className={`relative ${!fill ? '' : ''} bg-gray-100 rounded-lg overflow-hidden`} style={!fill ? { width: `${width}px`, height: `${height}px` } : {}}>
      {/* Loading placeholder */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Main image */}
      {fill ? (
        <Image 
          {...imageProps}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized={currentSrc.startsWith('data:')} // For SVG placeholders
        />
      ) : (
        <Image 
          {...imageProps}
          width={width}
          height={height}
          unoptimized={currentSrc.startsWith('data:')} // For SVG placeholders
        />
      )}
      
      {/* Error indicator */}
      {hasError && currentSrc === placeholderSrc && (
        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
          No Image
        </div>
      )}
    </div>
  )
}

export default ProfessionalFoodImage