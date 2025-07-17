'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

const featuredFoods = [
  {
    id: 'featured-1',
    name: 'Truffle Beef Burger',
    description: 'Premium beef patty with truffle sauce, aged cheddar, and caramelized onions',
    price: '699',
    originalPrice: '899',
    rating: 4.9,
    image: '🍔',
    badge: 'Chef\'s Special',
    category: 'Burgers'
  },
  {
    id: 'featured-2',
    name: 'Margherita Suprema',
    description: 'Wood-fired pizza with San Marzano tomatoes, buffalo mozzarella, and fresh basil',
    price: '549',
    originalPrice: '699',
    rating: 4.8,
    image: '🍕',
    badge: 'Best Seller',
    category: 'Pizza'
  },
  {
    id: 'featured-3',
    name: 'Dragon Roll Deluxe',
    description: 'Premium sushi roll with tempura shrimp, avocado, and spicy mayo drizzle',
    price: '899',
    originalPrice: '1199',
    rating: 5.0,
    image: '🍣',
    badge: 'Premium',
    category: 'Sushi'
  },
  {
    id: 'featured-4',
    name: 'Quinoa Power Bowl',
    description: 'Organic quinoa with grilled chicken, avocado, and superfood dressing',
    price: '449',
    originalPrice: '599',
    rating: 4.7,
    image: '🥗',
    badge: 'Healthy Choice',
    category: 'Salads'
  }
]

export function FeaturedFood() {
  const { addToCart } = useCart()
  const { user } = useAuth()
  const { toast } = useToast()

  const handleAddToCart = async (foodId: string, foodName: string) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be logged in to add items to cart",
        variant: "destructive"
      })
      return
    }

    try {
      const success = await addToCart(foodId, 1)
      if (success) {
        toast({
          title: "Added to cart",
          description: `${foodName} has been added to your cart`,
        })
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive"
      })
    }
  }

  return (
    <section className="py-20 bg-gradient-to-b from-muted/20 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-primary/10 rounded-full text-primary mb-6 border border-primary/20">
            <span className="text-sm font-semibold tracking-wide">Featured Dishes</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Today's
            <span className="bg-gradient-hero bg-clip-text text-transparent"> Special </span>
            Selection
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Handpicked by our master chefs, these exceptional dishes represent the finest 
            culinary experiences we have to offer.
          </p>
        </div>

        {/* Featured Foods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredFoods.map((food, index) => (
            <div
              key={food.id}
              className="group"
            >
              <Card className="relative overflow-hidden hover:shadow-luxury transition-all duration-500 bg-gradient-card border-0 hover:scale-[1.02]">
                <CardContent className="p-0">
                  {/* Food Image Section */}
                  <div className="relative bg-gradient-primary/5 p-8 text-center">
                    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      {food.image}
                    </div>
                    
                    {/* Badge */}
                    <div className="absolute top-4 left-4 bg-gradient-hero text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {food.badge}
                    </div>
                    
                    {/* Rating */}
                    <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
                      <span className="text-yellow-500">⭐</span>
                      <span className="text-xs font-semibold">{food.rating}</span>
                    </div>
                  </div>
                  
                  {/* Content Section */}
                  <div className="p-6">
                    <div className="mb-2">
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                        {food.category}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                      {food.name}
                    </h3>
                    
                    <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                      {food.description}
                    </p>
                    
                    {/* Price Section */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-primary">
                          ₹{food.price}
                        </span>
                        <span className="text-sm text-muted-foreground line-through">
                          ₹{food.originalPrice}
                        </span>
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    <Button 
                      variant="premium" 
                      size="lg" 
                      className="w-full group-hover:scale-105 transition-transform"
                      onClick={() => handleAddToCart(food.id, food.name)}
                    >
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-16">
          <Link href="/menu">
            <Button 
              variant="luxury" 
              size="xl"
              className="px-12"
            >
              View Full Menu
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}