'use client'

import { Navigation } from '@/components/Navigation'
import { HeroSection } from '@/components/HeroSection'
import { TodaysSpecialSection } from '@/components/TodaysSpecialSection'
import { AuthenticatedHomepage } from '@/components/AuthenticatedHomepage'
import { PremiumDashboard } from '@/components/PremiumDashboard'
import { QuickLogin } from '@/components/QuickLogin'
import { StatsSection } from '@/components/StatsSection'
import { AboutSection } from '@/components/AboutSection'
import { ContactSection } from '@/components/ContactSection'
import { Footer } from '@/components/Footer'
import { PerformanceIndicator } from '@/components/PerformanceIndicator'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()

  // Redirect admin users to admin dashboard
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      router.push('/admin')
    }
  }, [isAuthenticated, user, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background smooth-scroll">
        <Navigation />
        <main className="gpu-accelerated">
          <section className="py-12 pt-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading...</p>
              </div>
            </div>
          </section>
        </main>
      </div>
    )
  }

  if (isAuthenticated) {
    // If admin, don't render anything (redirecting)
    if (user?.role === 'admin') {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Redirecting to Admin Dashboard...</p>
          </div>
        </div>
      )
    }

    // Check if demo user
    const isDemoUser = user?.email === 'demo@yumzy.com' || user?.email?.includes('demo')
    
    if (isDemoUser) {
      // Demo users get limited homepage experience
      return (
        <div className="min-h-screen bg-background smooth-scroll">
          <Navigation />
          <main className="gpu-accelerated">
            <AuthenticatedHomepage isDemoUser={true} />
          </main>
          <PerformanceIndicator />
        </div>
      )
    }
    
    // Normal users get premium dashboard experience
    return (
      <div className="min-h-screen bg-background smooth-scroll">
        <Navigation />
        <main className="gpu-accelerated">
          <PremiumDashboard />
        </main>
        <PerformanceIndicator />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background smooth-scroll">
      <Navigation />
      <main className="gpu-accelerated">
        <HeroSection />
        
        <TodaysSpecialSection />
        
        {/* Professional Demo Login Section */}
        <section className="py-16 bg-gradient-to-b from-background via-muted/5 to-background relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 left-10 w-32 h-32 bg-primary rounded-full blur-2xl"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-orange-400 rounded-full blur-2xl"></div>
          </div>
          
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="bg-gradient-to-r from-card/80 via-card to-card/80 backdrop-blur-sm rounded-2xl border border-primary/10 p-8 shadow-2xl">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-orange-400/10 rounded-full px-6 py-3 mb-4">
                  <span className="text-2xl">🚀</span>
                  <span className="text-lg font-bold bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                    Experience Yumzy Demo
                  </span>
                </div>
                
                <h2 className="text-3xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                    Ready to Explore?
                  </span>
                </h2>
                
                <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto mb-6">
                  Login to access our premium database-driven menu with real food data, 
                  live order tracking, and real-time notifications!
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-sm">
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <div className="text-2xl mb-2 font-bold text-gray-900 dark:text-gray-100">50+</div>
                    <div className="text-gray-600 dark:text-gray-400">Premium Dishes</div>
                  </div>
                  <div className="text-center p-4 bg-orange-500/5 rounded-lg">
                    <div className="text-2xl mb-2">🔔</div>
                    <div className="text-gray-600 dark:text-gray-400">Real-time Tracking</div>
                  </div>
                  <div className="text-center p-4 bg-green-500/5 rounded-lg">
                    <div className="text-2xl mb-2">💳</div>
                    <div className="text-gray-600 dark:text-gray-400">Secure Payments</div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center">
                <QuickLogin />
              </div>
            </div>
          </div>
        </section>
        <StatsSection />
        <AboutSection />
        <ContactSection />
      </main>
      <Footer />
      <PerformanceIndicator />
    </div>
  );
}