'use client'

import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { MapPin, Phone, Mail, Clock, Send, MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'

const contactInfo = [
  {
    icon: MapPin,
    title: 'Visit Us',
    details: ['123 Food Street', 'Culinary District', 'New York, NY 10001'],
    color: 'text-blue-600'
  },
  {
    icon: Phone,
    title: 'Call Us',
    details: ['+1 (555) 123-FOOD', '+1 (555) 123-3663'],
    color: 'text-green-600'
  },
  {
    icon: Mail,
    title: 'Email Us',
    details: ['hello@yumzy.com', 'support@yumzy.com'],
    color: 'text-red-600'
  },
  {
    icon: Clock,
    title: 'Operating Hours',
    details: ['Mon - Fri: 8:00 AM - 11:00 PM', 'Sat - Sun: 9:00 AM - 12:00 AM'],
    color: 'text-purple-600'
  }
]

const faqs = [
  {
    question: 'What is your delivery time?',
    answer: 'We deliver fresh, hot meals within 30 minutes or less to most areas in our delivery zone.'
  },
  {
    question: 'Do you offer vegetarian/vegan options?',
    answer: 'Yes! We have a wide variety of vegetarian and vegan dishes clearly marked on our menu.'
  },
  {
    question: 'What are your delivery charges?',
    answer: 'Delivery is free for orders over ₹500. For orders under ₹500, a small delivery fee of ₹49 applies.'
  },
  {
    question: 'Can I modify my order after placing it?',
    answer: 'You can modify your order within 5 minutes of placing it by calling our support team.'
  }
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Message sent successfully! 📧",
          description: `Ticket #${data.data.ticketNumber} created. Check your email for confirmation!`,
          duration: 6000,
        })

        // Clear form
        setFormData({ name: '', email: '', subject: '', message: '' })
      } else {
        throw new Error(data.error || 'Failed to send message')
      }
    } catch (error) {
      console.error('Contact form error:', error)
      toast({
        title: "Failed to send message",
        description: error instanceof Error ? error.message : "Please try again or call our support line.",
        variant: "destructive",
        duration: 6000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

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
              Contact <span className="bg-gradient-hero bg-clip-text text-transparent">Us</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Have questions, feedback, or need assistance? We're here to help! 
              Reach out to us through any of the channels below.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="text-center h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <info.icon className={`h-8 w-8 mx-auto ${info.color}`} />
                    </div>
                    <h3 className="font-semibold text-lg mb-3">{info.title}</h3>
                    <div className="space-y-1">
                      {info.details.map((detail, idx) => (
                        <p key={idx} className="text-muted-foreground text-sm">
                          {detail}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & FAQ */}
      <section className="py-16 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Send us a Message
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Full Name *
                        </label>
                        <Input
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Your full name"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Email Address *
                        </label>
                        <Input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="your.email@example.com"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Subject *
                      </label>
                      <Input
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder="What's this about?"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Message *
                      </label>
                      <Textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Tell us more about your inquiry..."
                        rows={5}
                        required
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full gap-2" 
                      disabled={isSubmitting}
                    >
                      <Send className="h-4 w-4" />
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* FAQ Section */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
                <p className="text-muted-foreground">
                  Quick answers to common questions. Can't find what you're looking for? 
                  Send us a message!
                </p>
              </div>

              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <motion.div
                    key={faq.question}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="font-semibold mb-2">{faq.question}</h3>
                        <p className="text-muted-foreground text-sm">{faq.answer}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 p-6 bg-primary/10 rounded-lg">
                <h3 className="font-semibold mb-2">Need Immediate Help?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  For urgent order-related queries, call our 24/7 support line:
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-primary">
                    <Phone className="h-3 w-3 mr-1" />
                    +1 (555) 123-FOOD
                  </Badge>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl font-bold mb-4">Find Us</h2>
            <p className="text-muted-foreground">
              Visit our main location or find us on the map
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="bg-card rounded-lg p-2 shadow-lg"
          >
            {/* Placeholder for map - replace with actual map component */}
            <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 mx-auto text-primary mb-4" />
                <p className="text-muted-foreground">Interactive Map</p>
                <p className="text-sm text-muted-foreground">
                  123 Food Street, Culinary District, NY 10001
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}