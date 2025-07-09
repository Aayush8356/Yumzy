'use client'

import { useState, useEffect } from 'react'
import { ImageManager, ImageUrls } from '@/lib/image-manager'

interface ImageOptimizationConfig {
  enableOptimization: boolean
  preloadImages: boolean
  cacheImages: boolean
  fallbackStrategy: 'unsplash' | 'placeholder' | 'category'
}

export const useImageOptimization = (config: ImageOptimizationConfig = {
  enableOptimization: true,
  preloadImages: true,
  cacheImages: true,
  fallbackStrategy: 'unsplash'
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const optimizeImage = async (src: string, category?: string): Promise<string> => {
    if (!config.enableOptimization) return src

    setIsLoading(true)
    setError(null)

    try {
      // Try to process the original image
      const processedUrl = await ImageManager.processImageUrl(src)
      
      if (processedUrl) {
        setIsLoading(false)
        return processedUrl
      }

      // Apply fallback strategy
      let fallbackUrl: string
      switch (config.fallbackStrategy) {
        case 'unsplash':
          fallbackUrl = ImageUrls.generateUnsplashFood(category || 'default', 400, 300)
          break
        case 'placeholder':
          fallbackUrl = ImageUrls.generatePlaceholder(category || 'default', 400, 300)
          break
        case 'category':
          fallbackUrl = ImageUrls.generateUnsplashFood(category || 'default', 400, 300)
          break
        default:
          fallbackUrl = src
      }

      setIsLoading(false)
      return fallbackUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image optimization failed')
      setIsLoading(false)
      return src
    }
  }

  const preloadImages = async (urls: string[]): Promise<void> => {
    if (!config.preloadImages) return

    const promises = urls.map(url => {
      return new Promise<void>((resolve) => {
        const img = new Image()
        img.onload = () => resolve()
        img.onerror = () => resolve() // Don't fail on individual errors
        img.src = url
      })
    })

    await Promise.all(promises)
  }

  const validateImageBatch = async (items: Array<{ id: string; image: string }>): Promise<Map<string, boolean>> => {
    return ImageManager.validateBatchImages(items)
  }

  return {
    optimizeImage,
    preloadImages,
    validateImageBatch,
    isLoading,
    error
  }
}