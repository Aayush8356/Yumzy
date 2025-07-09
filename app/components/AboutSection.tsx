'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Award, Clock, Heart, Shield } from 'lucide-react'

const features = [
  {
    icon: Heart,
    title: 'Made with Love',
    description: 'Every dish is crafted with passion and attention to detail by our expert chefs.',
    color: 'text-red-500'
  },
  {
    icon: Clock,
    title: 'Lightning Fast',
    description: 'Average delivery time of 30 minutes or less, guaranteed fresh and hot.',
    color: 'text-orange-500'
  },
  {
    icon: Award,
    title: 'Premium Quality',
    description: 'Only the finest ingredients sourced from trusted local suppliers.',
    color: 'text-yellow-500'
  },
  {
    icon: Shield,
    title: 'Safe & Secure',
    description: 'Highest food safety standards and secure payment processing.',
    color: 'text-green-500'
  }
]

export function AboutSection() {
  return (
    <section id="about" className="py-20 bg-gradient-to-b from-background to-muted/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
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
            <span className="text-sm font-medium">About Yumzy</span>
          </motion.div>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Your Trusted 
            <span className="bg-gradient-hero bg-clip-text text-transparent"> Food Partner</span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Since 2020, Yumzy has been revolutionizing food delivery with our commitment 
            to quality, speed, and customer satisfaction. We connect you with the best 
            restaurants and chefs in your area.
          </p>
        </motion.div>

        {/* Story Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h3 className="text-2xl md:text-3xl font-bold">Our Story</h3>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Founded by food enthusiasts who believed that everyone deserves access to 
                restaurant-quality meals at home, Yumzy started as a small local service 
                and has grown into a trusted nationwide platform.
              </p>
              <p>
                Our mission is simple: deliver exceptional food experiences while supporting 
                local restaurants and communities. We've partnered with over 1,000 restaurants 
                and served more than 50,000 happy customers.
              </p>
              <p>
                Every order matters to us, and we're committed to making your dining experience 
                memorable, convenient, and delicious.
              </p>
            </div>
            <Button variant="hero" size="lg">
              Learn More About Us
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-gradient-card rounded-3xl p-8 shadow-elegant">
              <div className="grid grid-cols-2 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">1000+</div>
                  <div className="text-sm text-muted-foreground">Partner Restaurants</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">50K+</div>
                  <div className="text-sm text-muted-foreground">Happy Customers</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">100K+</div>
                  <div className="text-sm text-muted-foreground">Orders Delivered</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">4.9★</div>
                  <div className="text-sm text-muted-foreground">Average Rating</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-12">
            What Makes Us Special
          </h3>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <Card className="h-full hover:shadow-elegant transition-all duration-300 bg-gradient-card border-0">
                <CardContent className="p-6 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                    viewport={{ once: true }}
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-background ${feature.color} mb-4`}
                  >
                    <feature.icon size={32} />
                  </motion.div>
                  
                  <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}