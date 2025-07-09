'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, Clock, Award, Gift, Crown, Zap, ArrowRight, Sparkles } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import ProfessionalFoodImage from '@/components/ProfessionalFoodImage'

interface ExclusiveDeal {
  id: string
  title: string
  description: string
  originalPrice: string
  discountPrice: string
  discount: number
  image: string
  isLimited: boolean
  endTime?: string
}

interface FeaturedItem {
  id: string
  name: string
  description: string
  price: string
  image: string
  rating: string
  isNew: boolean
  isChefSpecial: boolean
  professionalCategories?: string[]
}

export function ExclusiveHomeContent() {
  const [exclusiveDeals, setExclusiveDeals] = useState<ExclusiveDeal[]>([])
  const [featuredItems, setFeaturedItems] = useState<FeaturedItem[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    // Simulate fetching exclusive content for logged-in users
    const fetchExclusiveContent = async () => {
      setLoading(true)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock exclusive deals
      setExclusiveDeals([
        {
          id: '1',
          title: 'Welcome Back Special',
          description: 'Exclusive 40% off on premium meals just for you!',
          originalPrice: '45.99',
          discountPrice: '27.59',
          discount: 40,
          image: 'https://source.unsplash.com/400x300/?gourmet,meal',
          isLimited: true,
          endTime: '2024-12-31'
        },
        {
          id: '2',
          title: 'Chef\'s Premium Collection',
          description: 'Limited edition dishes crafted by our master chefs',
          originalPrice: '65.99',
          discountPrice: '49.99',
          discount: 25,
          image: 'https://source.unsplash.com/400x300/?chef,special',
          isLimited: true
        }
      ])

      // Mock featured items for logged-in users
      setFeaturedItems([
        {
          id: '1',
          name: 'Truffle Mushroom Risotto',
          description: 'Premium risotto with black truffle and wild mushrooms',
          price: '32.99',
          image: 'https://source.unsplash.com/300x200/?risotto,truffle',
          rating: '4.9',
          isNew: true,
          isChefSpecial: false,
          professionalCategories: ['vegetarian', 'italian']
        },
        {
          id: '2',
          name: 'Wagyu Beef Tenderloin',
          description: 'Grade A5 Wagyu with seasonal vegetables',
          price: '89.99',
          image: 'https://source.unsplash.com/300x200/?wagyu,beef',
          rating: '5.0',
          isNew: false,
          isChefSpecial: true,
          professionalCategories: ['non-vegetarian', 'trending']
        },
        {
          id: '3',
          name: 'Lobster Thermidor',
          description: 'Fresh Atlantic lobster in creamy cognac sauce',
          price: '76.99',
          image: 'https://source.unsplash.com/300x200/?lobster,seafood',
          rating: '4.8',
          isNew: true,
          isChefSpecial: true,
          professionalCategories: ['non-vegetarian', 'trending']
        }
      ])
      
      setLoading(false)
    }

    fetchExclusiveContent()
  }, [])

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/3 mx-auto"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-48 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-950 dark:to-orange-950 rounded-full text-amber-800 dark:text-amber-200 mb-4">
            <Crown className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Welcome back, {user?.name || 'Premium Member'}!</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Exclusive
            <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent"> Premium </span>
            Collection
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover handpicked exclusive dishes and special offers available only to our valued members.
          </p>
        </motion.div>

        {/* Exclusive Deals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <Gift className="w-6 h-6 text-amber-600" />
              Exclusive Deals
            </h3>
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
              <Sparkles className="w-3 h-3 mr-1" />
              Members Only
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exclusiveDeals.map((deal, index) => (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-amber-200 dark:border-amber-800">
                  <div className="relative">
                    <ProfessionalFoodImage
                      src={deal.image}
                      alt={deal.title}
                      width={400}
                      height={200}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      professionalCategories={['trending']}
                    />
                    
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-red-500 text-white">
                        -{deal.discount}% OFF
                      </Badge>
                    </div>
                    
                    {deal.isLimited && (
                      <div className="absolute top-4 right-4">
                        <Badge variant="secondary" className="bg-amber-500 text-white">
                          <Zap className="w-3 h-3 mr-1" />
                          Limited
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-6">
                    <h4 className="text-xl font-bold mb-2">{deal.title}</h4>
                    <p className="text-muted-foreground mb-4">{deal.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-green-600">${deal.discountPrice}</span>
                        <span className="text-lg text-muted-foreground line-through">${deal.originalPrice}</span>
                      </div>
                      
                      <Button className="gap-2">
                        Claim Deal
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Premium Featured Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <Award className="w-6 h-6 text-amber-600" />
              Premium Featured
            </h3>
            <Link href="/menu">
              <Button variant="outline" className="gap-2">
                View Full Menu
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <div className="relative">
                    <ProfessionalFoodImage
                      src={item.image}
                      alt={item.name}
                      width={300}
                      height={200}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      professionalCategories={item.professionalCategories || []}
                    />
                    
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {item.isNew && (
                        <Badge className="bg-green-500 text-white text-xs">
                          <Sparkles className="w-3 h-3 mr-1" />
                          New
                        </Badge>
                      )}
                      {item.isChefSpecial && (
                        <Badge className="bg-purple-500 text-white text-xs">
                          <Crown className="w-3 h-3 mr-1" />
                          Chef's Special
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-lg">{item.name}</h4>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{item.rating}</span>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground text-sm mb-4">{item.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold">${item.price}</span>
                      <Button size="sm" className="gap-2">
                        <ArrowRight className="w-4 h-4" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border-amber-200 dark:border-amber-800">
            <CardContent className="py-12">
              <Crown className="w-12 h-12 text-amber-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">Ready to explore more?</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Discover our complete menu with over 50+ premium dishes and exclusive member benefits.
              </p>
              <Link href="/menu">
                <Button size="lg" className="gap-2">
                  Explore Full Menu
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}

export default ExclusiveHomeContent