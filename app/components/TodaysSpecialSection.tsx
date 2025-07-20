'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, Clock, ChefHat, Sparkles, ArrowRight, Lock } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { ProfessionalFoodImage } from '@/components/ProfessionalFoodImage'

const todaysSpecials = [
  {
    id: 'special-1',
    name: 'Truffle Mushroom Risotto',
    description: 'Creamy Arborio rice with black truffle, wild mushrooms, and aged Parmesan',
    price: '₹420',
    originalPrice: '₹520',
    discount: 18,
    rating: 4.9,
    reviews: 127,
    cookTime: '25 min',
    image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&h=300&fit=crop',
    isVegetarian: true,
    isChefSpecial: true,
    difficulty: 'Premium'
  },
  {
    id: 'special-2',
    name: 'Wagyu Beef Tenderloin',
    description: 'Grade A5 Wagyu with roasted vegetables and red wine jus',
    price: '₹680',
    originalPrice: '₹820',
    discount: 13,
    rating: 5.0,
    reviews: 89,
    cookTime: '35 min',
    image: 'https://images.unsplash.com/photo-1559847844-d721426d6924?w=400&h=300&fit=crop',
    isVegetarian: false,
    isChefSpecial: true,
    difficulty: 'Premium'
  },
  {
    id: 'special-3',
    name: 'Lobster Thermidor',
    description: 'Fresh Maine lobster with cognac cream sauce and gruyere cheese',
    price: '₹580',
    originalPrice: '₹720',
    discount: 13,
    rating: 4.8,
    reviews: 95,
    cookTime: '30 min',
    image: 'https://images.unsplash.com/photo-1559737558-2f5a35546024?w=400&h=300&fit=crop',
    isVegetarian: false,
    isChefSpecial: true,
    difficulty: 'Premium'
  }
]

export function TodaysSpecialSection() {
  const { isAuthenticated } = useAuth()
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  return (
    <section className="py-20 bg-gradient-to-b from-background via-muted/10 to-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-orange-400 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-orange-400/10 rounded-full px-6 py-3 mb-6">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
              Today's Special Selection
            </span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-gray-900 via-primary to-orange-600 bg-clip-text text-transparent">
              Chef's Curated
            </span>
            <br />
            <span className="text-3xl sm:text-4xl text-gray-900 dark:text-gray-100">Premium Collection</span>
          </h2>
          
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            Handpicked by our master chefs using the finest ingredients. Available for limited time only.
          </p>
        </motion.div>

        {/* Specials Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {todaysSpecials.map((special, index) => (
            <motion.div
              key={special.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              onHoverStart={() => setHoveredCard(special.id)}
              onHoverEnd={() => setHoveredCard(null)}
              className="group"
            >
              <Card className="relative overflow-hidden border-2 border-transparent hover:border-primary/20 transition-all duration-500 hover:shadow-2xl bg-card/50 backdrop-blur-sm">
                {/* Special Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <Badge className="bg-gradient-to-r from-primary to-orange-500 text-white">
                    <ChefHat className="h-3 w-3 mr-1" />
                    Chef's Special
                  </Badge>
                </div>

                {/* Discount Badge */}
                <div className="absolute top-4 right-4 z-10">
                  <Badge variant="destructive" className="bg-red-500">
                    -{special.discount}% OFF
                  </Badge>
                </div>

                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <ProfessionalFoodImage
                    src={special.image}
                    alt={special.name}
                    fill={true}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    professionalCategories={[special.name.toLowerCase().split(' ')[0], 'premium', 'special']}
                    priority={index === 0}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  
                  {/* Overlay Info */}
                  <div className="absolute bottom-4 left-4 text-white">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{special.rating}</span>
                      </div>
                      <span className="text-sm opacity-80">({special.reviews} reviews)</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">{special.cookTime}</span>
                      </div>
                      {special.isVegetarian && (
                        <Badge variant="outline" className="text-green-400 border-green-400">
                          Vegetarian
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {special.name}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {special.description}
                  </p>

                  {/* Pricing */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-primary">
                        {special.price}
                      </span>
                      <span className="text-lg text-gray-500 dark:text-gray-400 line-through">
                        {special.originalPrice}
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {special.difficulty}
                    </Badge>
                  </div>

                  {/* Action Button */}
                  {isAuthenticated ? (
                    <Button className="w-full group/btn">
                      <ChefHat className="h-4 w-4 mr-2" />
                      Order Now
                      <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/auth/login">
                        <Lock className="h-4 w-4 mr-2" />
                        Sign In to Order
                      </Link>
                    </Button>
                  )}
                </CardContent>

                {/* Hover Effect Overlay */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 pointer-events-none"
                  animate={{
                    opacity: hoveredCard === special.id ? 1 : 0
                  }}
                  transition={{ duration: 0.3 }}
                />
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-primary/5 via-orange-400/5 to-primary/5 rounded-2xl p-8 border border-primary/10">
            <h3 className="text-2xl font-bold mb-4">
              Ready for a Premium Dining Experience?
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              Join thousands of food lovers who trust Yumzy for restaurant-quality meals delivered to their door.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Button size="lg" className="px-8" asChild>
                  <Link href="/menu">
                    <ChefHat className="h-5 w-5 mr-2" />
                    Explore Full Menu
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button size="lg" className="px-8" asChild>
                    <Link href="/auth/register">
                      <Sparkles className="h-5 w-5 mr-2" />
                      Join Yumzy
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" className="px-8" asChild>
                    <Link href="/preview">
                      View Preview Menu
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}