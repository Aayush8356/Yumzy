'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Navigation } from '@/components/Navigation'

export default function SeedPage() {
  const [isSeeding, setIsSeeding] = useState(false)
  const [result, setResult] = useState<any>(null)
  const { toast } = useToast()

  const handleSeed = async () => {
    setIsSeeding(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const data = await response.json()
      setResult(data)
      
      if (data.success) {
        toast({
          title: "Success",
          description: data.message,
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to seed database",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error seeding database:', error)
      toast({
        title: "Error",
        description: "Failed to seed database",
        variant: "destructive"
      })
    } finally {
      setIsSeeding(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-24">
          <Card>
            <CardHeader>
              <CardTitle>Database Seeding</CardTitle>
              <p className="text-muted-foreground">
                Seed the database with initial categories and food items
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleSeed} 
                disabled={isSeeding}
                className="w-full"
              >
                {isSeeding ? 'Seeding Database...' : 'Seed Database'}
              </Button>
              
              {result && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-sm">Result</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}