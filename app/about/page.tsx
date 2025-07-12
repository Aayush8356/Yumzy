'use client'

import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Award, Users, Clock, Heart, Shield, Leaf, ChefHat, Star } from 'lucide-react'
import { motion } from 'framer-motion'

const values = [
  {
    icon: Heart,
    title: 'Passion for Food',
    description: 'Every dish is crafted with love and attention to detail'
  },
  {
    icon: Leaf,
    title: 'Fresh Ingredients',
    description: 'We source the finest, locally-grown ingredients daily'
  },
  {
    icon: Shield,
    title: 'Quality Assurance',
    description: 'Rigorous quality checks ensure every meal meets our standards'
  },
  {
    icon: Clock,
    title: 'Fast Delivery',
    description: 'Hot, fresh meals delivered to your door in 30 minutes or less'
  }
]

const team = [
  {
    name: 'Chef Marcus Johnson',
    role: 'Head Chef',
    image: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=300&h=300&fit=crop&crop=face',
    experience: '15+ years'
  },
  {
    name: 'Sarah Chen',
    role: 'Operations Manager',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b602?w=300&h=300&fit=crop&crop=face',
    experience: '8+ years'
  },
  {
    name: 'David Rodriguez',
    role: 'Sous Chef',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face',
    experience: '10+ years'
  }
]

const stats = [
  { icon: Users, label: 'Happy Customers', value: '50,000+' },
  { icon: ChefHat, label: 'Expert Chefs', value: '25+' },
  { icon: Award, label: 'Awards Won', value: '15+' },
  { icon: Star, label: 'Average Rating', value: '4.9' }
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-primary/10 via-accent/5 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              About <span className="bg-gradient-hero bg-clip-text text-transparent">Yumzy</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We&apos;re passionate about bringing you the finest culinary experiences, 
              delivered fresh to your doorstep with unmatched speed and quality.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
                Our Story
              </Badge>
              <h2 className="text-3xl font-bold mb-6">
                From Kitchen to Your Table
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Founded in 2020, Yumzy began as a small family restaurant with a big dream: 
                  to make exceptional food accessible to everyone. Our founders, passionate about 
                  culinary excellence, noticed the gap between restaurant-quality meals and 
                  convenient food delivery.
                </p>
                <p>
                  Today, we&apos;ve grown into a trusted platform serving thousands of customers daily, 
                  but our core values remain unchanged. Every dish is prepared with the same care 
                  and attention to detail that made us who we are.
                </p>
                <p>
                  We partner with local farms and suppliers to ensure the freshest ingredients, 
                  supporting our community while delivering uncompromising quality to your table.
                </p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <img
                src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop"
                alt="Our kitchen"
                className="rounded-3xl shadow-elegant"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These core principles guide everything we do, from ingredient selection to delivery
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="text-center h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <value.icon className="h-12 w-12 mx-auto text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                    <p className="text-muted-foreground text-sm">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <stat.icon className="h-8 w-8 mx-auto text-primary mb-2" />
                <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The passionate professionals behind every delicious meal
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <Card className="text-center overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <Badge className="absolute bottom-4 left-4 bg-primary">
                      {member.experience}
                    </Badge>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-1">{member.name}</h3>
                    <p className="text-muted-foreground">{member.role}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-4">Ready to Experience the Difference?</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust us for their daily meals. 
              Order now and taste the quality for yourself.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="px-8">
                Order Now
              </Button>
              <Button variant="outline" size="lg" className="px-8">
                View Menu
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}