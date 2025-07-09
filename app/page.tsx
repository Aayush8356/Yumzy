'use client'

import { Navigation } from '@/components/Navigation'
import { HeroSection } from '@/components/HeroSection'
import { FoodCategories } from '@/components/FoodCategories'
import { AuthenticatedHomepage } from '@/components/AuthenticatedHomepage'
import { QuickLogin } from '@/components/QuickLogin'
import { FeaturedFood } from '@/components/FeaturedFood'
import { StatsSection } from '@/components/StatsSection'
import { AboutSection } from '@/components/AboutSection'
import { ContactSection } from '@/components/ContactSection'
import { Footer } from '@/components/Footer'
import { PerformanceIndicator } from '@/components/PerformanceIndicator'
import { useAuth } from '@/contexts/AuthContext'

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth()

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
    return (
      <div className="min-h-screen bg-background smooth-scroll">
        <Navigation />
        <main className="gpu-accelerated">
          <AuthenticatedHomepage />
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
        
        {/* Login Demo Section */}
        <section className="py-12 bg-gradient-to-b from-muted/20 to-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">🚀 Demo Login</h2>
              <p className="text-muted-foreground">Login to see the premium database-driven menu with real food data and notifications!</p>
            </div>
            <div className="flex justify-center">
              <QuickLogin />
            </div>
          </div>
        </section>

        <FoodCategories />
        <FeaturedFood />
        <StatsSection />
        <AboutSection />
        <ContactSection />
      </main>
      <Footer />
      <PerformanceIndicator />
    </div>
  );
}