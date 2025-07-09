'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'

const contactInfo = [
  {
    icon: Phone,
    title: 'Call Us',
    details: '+1 (555) 123-4567',
    subtitle: 'Mon-Sun: 8AM - 11PM',
    color: 'text-blue-500'
  },
  {
    icon: Mail,
    title: 'Email Us',
    details: 'hello@yumzy.com',
    subtitle: 'We reply within 24 hours',
    color: 'text-green-500'
  },
  {
    icon: MapPin,
    title: 'Visit Us',
    details: '123 Food Street',
    subtitle: 'Culinary District, CD 12345',
    color: 'text-orange-500'
  },
  {
    icon: Clock,
    title: 'Working Hours',
    details: '8AM - 11PM',
    subtitle: 'Monday to Sunday',
    color: 'text-purple-500'
  }
]

export function ContactSection() {
  return (
    <section id="contact" className="py-20 bg-gradient-to-b from-muted/10 to-background">
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
            <span className="text-sm font-medium">Get in Touch</span>
          </motion.div>
          
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            We'd Love to 
            <span className="bg-gradient-hero bg-clip-text text-transparent"> Hear From You</span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Have questions, feedback, or need assistance? Our friendly team is here to help 
            you with anything you need.
          </p>
        </motion.div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {contactInfo.map((info, index) => (
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
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-background ${info.color} mb-4`}
                  >
                    <info.icon size={24} />
                  </motion.div>
                  
                  <h4 className="font-semibold mb-2">{info.title}</h4>
                  <p className="font-medium text-primary mb-1">{info.details}</p>
                  <p className="text-sm text-muted-foreground">{info.subtitle}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Contact Form */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-2xl font-bold mb-4">Send us a Message</h3>
              <p className="text-muted-foreground">
                Fill out the form below and we'll get back to you as soon as possible. 
                We typically respond within 24 hours.
              </p>
            </div>

            <form className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">First Name</label>
                  <Input placeholder="John" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Last Name</label>
                  <Input placeholder="Doe" />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Email Address</label>
                <Input type="email" placeholder="john@example.com" />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Phone Number</label>
                <Input type="tel" placeholder="+1 (555) 123-4567" />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Subject</label>
                <Input placeholder="How can we help you?" />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Message</label>
                <Textarea 
                  placeholder="Tell us more about your inquiry..."
                  className="min-h-[120px] resize-none"
                />
              </div>
              
              <Button variant="hero" size="lg" className="w-full">
                Send Message
              </Button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-2xl font-bold mb-4">Frequently Asked Questions</h3>
            </div>

            <div className="space-y-4">
              <Card className="bg-gradient-card border-0">
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-2">What are your delivery areas?</h4>
                  <p className="text-sm text-muted-foreground">
                    We currently deliver to all major cities and suburbs. Enter your address 
                    during checkout to see if we deliver to your location.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-0">
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-2">How long does delivery take?</h4>
                  <p className="text-sm text-muted-foreground">
                    Our average delivery time is 30 minutes, but it can vary based on your 
                    location, weather conditions, and restaurant preparation time.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-0">
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-2">Do you offer refunds?</h4>
                  <p className="text-sm text-muted-foreground">
                    Yes, we offer full refunds for orders that don't meet our quality standards. 
                    Contact us within 24 hours of delivery for assistance.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-0">
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-2">Can I schedule orders in advance?</h4>
                  <p className="text-sm text-muted-foreground">
                    Absolutely! You can schedule orders up to 7 days in advance. 
                    Just select your preferred delivery time during checkout.
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}