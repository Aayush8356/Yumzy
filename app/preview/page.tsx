'use client'

import { Navigation } from '@/components/Navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, Clock, Users, ArrowRight, Crown, Lock } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface PreviewItem {
  id: string
  name: string
  shortDescription: string
  image: string
  rating: string
  cookTime: string
  isPopular: boolean
  isVegetarian: boolean
  tags: string[]
}

export default function PreviewPage() {
  const [previewItems, setPreviewItems] = useState<PreviewItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading preview items (in real app, this could be a limited public API)
    const loadPreviewItems = async () => {
      setLoading(true)
      
      // Mock data for preview - in real app, fetch from public API
      const mockPreviewItems: PreviewItem[] = [
        {
          id: '1',
          name: 'Signature Truffle Pasta',
          shortDescription: 'Artisanal pasta with black truffle and parmesan',
          image: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop',
          rating: '4.8',
          cookTime: '25 min',
          isPopular: true,
          isVegetarian: true,
          tags: ['Italian', 'Premium']
        },
        {
          id: '2',
          name: 'Wagyu Beef Burger',
          shortDescription: 'Premium wagyu beef with artisanal cheese',
          image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
          rating: '4.9',
          cookTime: '20 min',
          isPopular: true,
          isVegetarian: false,
          tags: ['American', 'Premium']
        },
        {
          id: '3',
          name: 'Lobster Risotto',
          shortDescription: 'Creamy risotto with fresh Maine lobster',
          image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&h=300&fit=crop',
          rating: '4.7',
          cookTime: '30 min',
          isPopular: true,
          isVegetarian: false,
          tags: ['Seafood', 'Luxury']
        },
        {
          id: '4',
          name: 'Artisan Sushi Platter',
          shortDescription: 'Chef\'s selection of premium sushi',
          image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
          rating: '4.9',
          cookTime: '15 min',
          isPopular: true,
          isVegetarian: false,
          tags: ['Japanese', 'Fresh']
        }
      ]

      // Simulate API delay
      setTimeout(() => {
        setPreviewItems(mockPreviewItems)
        setLoading(false)
      }, 1000)
    }

    loadPreviewItems()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Navigation />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Crown className="h-4 w-4" />
            Premium Dining Experience
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Exquisite Flavors
            <br />
            <span className="text-3xl sm:text-5xl">Await You</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Experience culinary excellence with our carefully curated menu featuring premium ingredients, 
            innovative recipes, and restaurant-quality dishes delivered to your door.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="px-8 py-6 text-lg">
              <Link href="/auth/register">
                <Users className="mr-2 h-5 w-5" />
                Join Yumzy
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            
            <Button variant="outline" size="lg" asChild className="px-8 py-6 text-lg">
              <Link href="/auth/login">
                Already a member? Sign In
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Preview Notice */}
        <motion.div
          className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Lock className="h-5 w-5 text-amber-600" />
            <span className="font-semibold text-amber-900 dark:text-amber-100">Member-Exclusive Menu</span>
          </div>
          <p className="text-amber-800 dark:text-amber-200">
            Our full menu with 50+ premium dishes, detailed nutritional information, and member pricing 
            is available exclusively to Yumzy members. Join today to unlock the complete experience!
          </p>
        </motion.div>

        {/* Featured Dishes Preview */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">Featured Creations</h2>
            <p className="text-lg text-muted-foreground">
              A glimpse of what awaits you as a Yumzy member
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <div className="h-48 bg-muted rounded-t-lg"></div>
                  <CardContent className="p-4 space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-full"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {previewItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 overflow-hidden">
                    <div className="relative overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300" />
                      <div className="absolute top-3 left-3">
                        {item.isPopular && (
                          <Badge className="bg-primary text-primary-foreground">
                            <Crown className="h-3 w-3 mr-1" />
                            Popular
                          </Badge>
                        )}
                      </div>
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="flex items-center gap-2 text-white text-sm">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{item.rating}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{item.cookTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                        {item.shortDescription}
                      </p>
                      
                      <div className="flex flex-wrap gap-1 mb-4">
                        {item.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {item.isVegetarian && (
                          <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                            Vegetarian
                          </Badge>
                        )}
                      </div>

                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                          <Lock className="h-4 w-4" />
                          <span className="text-sm font-medium">Member Access Required</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Membership Benefits */}
        <motion.div
          className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-8 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Why Join Yumzy?</h2>
            <p className="text-lg text-muted-foreground">
              Unlock exclusive benefits and premium dining experiences
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Premium Menu Access</h3>
              <p className="text-muted-foreground">
                Access to 50+ carefully curated dishes from world-class chefs
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Restaurant Quality</h3>
              <p className="text-muted-foreground">
                Fresh ingredients, professional preparation, delivered with care
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Member Community</h3>
              <p className="text-muted-foreground">
                Join a community of food enthusiasts and unlock special offers
              </p>
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-3xl font-bold mb-4">Ready to Begin Your Culinary Journey?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of food lovers who have discovered the perfect blend of convenience and quality with Yumzy.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="px-8 py-6 text-lg">
              <Link href="/auth/register">
                <Users className="mr-2 h-5 w-5" />
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            
            <Button variant="outline" size="lg" asChild className="px-8 py-6 text-lg">
              <Link href="/contact">
                Learn More
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}