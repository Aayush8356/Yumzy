'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { getPublicMenuItems, getCategoriesWithCounts } from '@/data/food-items'
import Link from 'next/link'

// Get public menu items and their categories
const publicItems = getPublicMenuItems()
const publicCategories = getCategoriesWithCounts(publicItems)

const categoryEmojis: Record<string, string> = {
  'Burgers': '🍔',
  'Pizza': '🍕',
  'Asian': '🍜',
  'Healthy': '🥗',
  'Desserts': '🍰',
  'Wraps': '🌯',
  'Sandwiches': '🥪',
  'Indian': '🍛',
  'Mexican': '🌮',
  'Italian': '🍝',
  'Beverages': '🥤'
}

const categoryColors: Record<string, {bgColor: string, borderColor: string}> = {
  'Burgers': { bgColor: 'bg-orange-100', borderColor: 'border-orange-200' },
  'Pizza': { bgColor: 'bg-red-100', borderColor: 'border-red-200' },
  'Asian': { bgColor: 'bg-green-100', borderColor: 'border-green-200' },
  'Healthy': { bgColor: 'bg-emerald-100', borderColor: 'border-emerald-200' },
  'Desserts': { bgColor: 'bg-yellow-100', borderColor: 'border-yellow-200' },
  'Wraps': { bgColor: 'bg-blue-100', borderColor: 'border-blue-200' },
  'Sandwiches': { bgColor: 'bg-purple-100', borderColor: 'border-purple-200' },
  'Indian': { bgColor: 'bg-amber-100', borderColor: 'border-amber-200' },
  'Mexican': { bgColor: 'bg-lime-100', borderColor: 'border-lime-200' },
  'Italian': { bgColor: 'bg-rose-100', borderColor: 'border-rose-200' },
  'Beverages': { bgColor: 'bg-cyan-100', borderColor: 'border-cyan-200' }
}

export function FoodCategories() {
  return (
    <section id="menu" className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full text-primary mb-4"
          >
            <span className="text-sm font-medium">Preview Menu</span>
          </motion.div>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Sample Menu
            <span className="bg-gradient-hero bg-clip-text text-transparent"> Categories </span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
            Get a taste of our diverse menu featuring cuisines from around the world. 
            Login to see our complete selection with 50+ premium dishes!
          </p>

          {/* Login CTA */}
          <div className="bg-gradient-to-r from-orange-100 to-yellow-100 border border-orange-200 rounded-lg p-4 max-w-lg mx-auto mb-8">
            <p className="text-orange-800 font-medium mb-2">🔐 Want to see more?</p>
            <p className="text-orange-700 text-sm mb-3">Login to access our full menu with 50+ items including Indian, Mexican, Italian cuisines and more!</p>
            <Link href="/auth/login" className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium">
              Login for Full Menu →
            </Link>
          </div>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {publicCategories.map((category, index) => {
            const colors = categoryColors[category.category] || { bgColor: 'bg-gray-100', borderColor: 'border-gray-200' }
            const emoji = categoryEmojis[category.category] || '🍽️'
            
            return (
              <div
                key={category.category}
                className="group cursor-pointer"
              >
                <Card className={`relative overflow-hidden hover:shadow-luxury transition-all duration-500 bg-gradient-card border ${colors.borderColor} hover:border-primary/30`}>
                  <CardContent className="p-8">
                    {/* Background Accent */}
                    <div className={`absolute top-0 right-0 w-24 h-24 ${colors.bgColor} rounded-bl-full`} />
                    
                    {/* Content */}
                    <div className="relative z-10">
                      <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                        {emoji}
                      </div>
                      
                      <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                        {category.category}
                      </h3>
                      
                      <p className="text-muted-foreground mb-4 leading-relaxed">
                        Premium {category.category.toLowerCase()} prepared with finest ingredients
                      </p>
                      
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                          {category.count} sample{category.count > 1 ? 's' : ''}
                        </span>
                        
                        <Link href="/auth/login" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
                          Login to See More <span>→</span>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>

        {/* Login for Full Menu Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={ { once: true }}
          className="text-center mt-12"
        >
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-2">🍽️ Ready for the Full Experience?</h3>
            <p className="text-gray-600 mb-4">Join thousands of satisfied customers and unlock:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm">
              <div className="text-center">
                <div className="text-2xl mb-1">50+</div>
                <div className="text-gray-600">Premium Dishes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">8</div>
                <div className="text-gray-600">Cuisine Types</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">🌱</div>
                <div className="text-gray-600">Veg & Vegan Options</div>
              </div>
            </div>
            <Link href="/auth/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Login to Access Full Menu →
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}