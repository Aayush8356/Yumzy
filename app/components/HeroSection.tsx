'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Star, Clock, ShoppingCart, Flame, Timer, Tag } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/contexts/CartContext'
import { useToast } from '@/hooks/use-toast'
import { FoodItem } from '@/lib/db/schema'
import Link from 'next/link'

export function HeroSection() {
  const [dailySpecial, setDailySpecial] = useState<FoodItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    const fetchSpecial = async () => {
      try {
        const response = await fetch('/api/menu/daily-special');
        const data = await response.json();
        if (data.success) {
          setDailySpecial(data.item);
        }
      } catch (error) {
        console.error("Failed to fetch daily special:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSpecial();
  }, []);

  const handleImageError = () => {
    setImageError(true);
  };

  const getImageUrl = (item: FoodItem) => {
    if (imageError) {
      // Fallback to a generic food image
      return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&crop=center';
    }
    return item.image;
  };

  const handleAddToCart = async () => {
    if (!dailySpecial) return;
    const success = await addToCart(dailySpecial.id, 1);
    if (success) {
      toast({
        title: "Added to cart",
        description: `${dailySpecial.name} has been added to your cart`,
      });
    }
  };
  
  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-background via-background/98 to-background/95">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_1px_1px,_rgb(0_0_0)_1px,_transparent_0)] bg-[length:24px_24px]" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-accent/3 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
      
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-16 items-center min-h-[calc(100vh-10rem)]">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8 lg:space-y-10 lg:pr-8"
          >
            <div className="space-y-6">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[0.9] tracking-tight"
              >
                <span className="block">Delicious</span>
                <span className="block bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
                  Food Delivered
                </span>
                <span className="block text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium text-muted-foreground/80">
                  in minutes
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed"
              >
                Experience premium cuisine from top restaurants delivered to your doorstep with our lightning-fast service and quality guarantee.
              </motion.p>
            </div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href="/menu">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground px-8 py-6 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <ShoppingCart className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                  Start Ordering
                </Button>
              </Link>
              <Link href="/menu">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="px-8 py-6 text-lg font-semibold rounded-2xl border-2 hover:bg-accent/5 backdrop-blur-sm"
                >
                  Explore Menu
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="grid grid-cols-3 gap-8 pt-6"
            >
              <div className="text-center lg:text-left">
                <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">50K+</div>
                <div className="text-sm font-medium text-muted-foreground mt-1">Happy Customers</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">25min</div>
                <div className="text-sm font-medium text-muted-foreground mt-1">Avg. Delivery</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">4.9★</div>
                <div className="text-sm font-medium text-muted-foreground mt-1">User Rating</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Daily Special */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative lg:pl-8 mt-12 lg:mt-0"
          >
            {loading ? (
              <div className="w-full h-[450px] bg-muted rounded-[2rem] animate-pulse" />
            ) : dailySpecial ? (
              <div className="relative">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                  className="absolute -top-4 left-6 z-30"
                >
                  <div className="relative">
                    <Badge className="px-4 py-2 text-sm font-bold bg-gradient-to-r from-red-500 via-orange-500 to-red-500 text-white shadow-lg">
                      <Flame className="w-4 h-4 mr-2" />
                      TODAY'S SPECIAL
                    </Badge>
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 rounded-full blur-md opacity-30 animate-pulse" />
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, -12, 0], rotateY: [0, 2, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" }}
                  className="relative rounded-[2rem] overflow-hidden shadow-[0_25px_60px_-10px_rgba(0,0,0,0.3)] bg-card will-change-transform group"
                  style={{ transform: "translateZ(0) perspective(1000px)", backfaceVisibility: "hidden" }}
                >
                  <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 p-1">
                    <div className="w-full h-full bg-background rounded-[calc(2rem-4px)]" />
                  </div>
                  
                  <div className="relative rounded-[calc(2rem-4px)] overflow-hidden">
                    <img 
                      src={getImageUrl(dailySpecial)}
                      alt={dailySpecial.name}
                      className="w-full h-[450px] object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="eager"
                      decoding="async"
                      onError={handleImageError}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-white">
                      <div className="space-y-3 md:space-y-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h3 className="text-xl md:text-2xl lg:text-3xl font-bold mb-1 md:mb-2 leading-tight">{dailySpecial.name}</h3>
                            <p className="text-xs md:text-sm text-gray-200 line-clamp-2 opacity-90 leading-relaxed">
                              {dailySpecial.description}
                            </p>
                          </div>
                          {(Number(dailySpecial.discount) > 0) && (
                            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg text-xs md:text-sm">
                              <Tag className="w-3 h-3 mr-1" />
                              {dailySpecial.discount}% OFF
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm font-semibold">{dailySpecial.rating}</span>
                            </div>
                            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5">
                              <Timer className="w-4 h-4 text-blue-400" />
                              <span className="text-sm font-semibold">{dailySpecial.cookTime}</span>
                            </div>
                          </div>
                          <div className="text-right sm:text-right">
                            {dailySpecial.originalPrice && Number(dailySpecial.originalPrice) > 0 && (
                              <span className="text-sm text-gray-300 line-through block">₹{dailySpecial.originalPrice}</span>
                            )}
                            <div className="text-2xl md:text-3xl font-bold text-emerald-400">₹{dailySpecial.price}</div>
                          </div>
                        </div>

                        {/* Integrated Order Button */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 1.4 }}
                          className="pt-4 border-t border-white/20"
                        >
                          <Button 
                            size="lg" 
                            className="w-full bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 hover:from-orange-600 hover:via-red-600 hover:to-orange-600 text-white px-6 py-4 text-base md:text-lg font-semibold rounded-xl shadow-[0_8px_30px_-8px_rgba(255,69,0,0.4)] hover:shadow-[0_12px_40px_-8px_rgba(255,69,0,0.5)] transition-all duration-300 group"
                            onClick={handleAddToCart}
                          >
                            <ShoppingCart className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                            Order Now - ₹{dailySpecial.price}
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            ) : (
              <div className="w-full h-[450px] bg-muted rounded-[2rem] flex items-center justify-center">
                <p className="text-muted-foreground">No special available today</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
