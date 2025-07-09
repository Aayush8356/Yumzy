'use client'

import { motion } from 'framer-motion'
import { Users, Clock, Star, ShoppingCart } from 'lucide-react'

const stats = [
  {
    icon: Users,
    value: '50,000+',
    label: 'Happy Customers',
    description: 'Satisfied customers worldwide',
    color: 'text-blue-500'
  },
  {
    icon: ShoppingCart,
    value: '100,000+',
    label: 'Orders Delivered',
    description: 'Successfully completed orders',
    color: 'text-green-500'
  },
  {
    icon: Clock,
    value: '30 min',
    label: 'Average Delivery',
    description: 'Lightning fast delivery time',
    color: 'text-orange-500'
  },
  {
    icon: Star,
    value: '4.9/5',
    label: 'Customer Rating',
    description: 'Based on 10,000+ reviews',
    color: 'text-yellow-500'
  }
]

export function StatsSection() {
  return (
    <section className="py-20 bg-gradient-luxury relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-gradient-glass opacity-20" />
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-premium-purple/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-premium-gold/20 rounded-full blur-3xl" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Why Choose Yumzy?
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust us for their daily meals
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="text-center bg-gradient-glass backdrop-blur-lg rounded-2xl p-8 hover:bg-white/30 transition-all duration-300 border border-white/20 shadow-luxury"
            >
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                viewport={{ once: true }}
                className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-primary ${stat.color} mb-6 shadow-glow`}
              >
                <stat.icon size={32} className="text-white" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 + 0.5 }}
                viewport={{ once: true }}
              >
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-lg font-semibold text-white mb-2">
                  {stat.label}
                </div>
                <div className="text-sm text-white/70">
                  {stat.description}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const menuSection = document.getElementById('menu')
              if (menuSection) {
                menuSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
            }}
            className="inline-flex items-center px-8 py-4 bg-white text-primary rounded-xl font-semibold shadow-luxury hover:shadow-luxury transition-all duration-300 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-primary before:opacity-0 hover:before:opacity-10 before:transition-opacity"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Start Ordering Now
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}