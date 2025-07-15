'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function SeedDBPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const seedDatabase = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/seed', { method: 'POST' })
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ success: false, error: 'Failed to seed database' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Database Seeding</CardTitle>
          <p className="text-muted-foreground">
            Click the button below to seed the database with sample food items and categories.
            This is a one-time operation needed for the menu to work properly.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={seedDatabase} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Seeding Database...' : 'Seed Database Now'}
          </Button>

          <div className="text-sm text-gray-600">
            <p><strong>Alternative:</strong> You can also access the seeding endpoint directly:</p>
            <code className="bg-gray-200 p-2 rounded block mt-2">
              {typeof window !== 'undefined' ? window.location.origin : ''}/api/seed
            </code>
          </div>
          
          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Result</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto whitespace-pre-wrap">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}