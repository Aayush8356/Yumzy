'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, DollarSign, TrendingUp, Package, ShoppingCart } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface MigrationSummary {
  foodItemsUpdated: number
  orderItemsUpdated: number
  ordersUpdated: number
  totalValueBefore: number
  totalValueAfter: number
  valueChange: number
  percentageChange: number
}

export default function PricingMigrationPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [migrationResult, setMigrationResult] = useState<MigrationSummary | null>(null)

  const runMigration = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/migrate-pricing', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer admin-token',
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()
      
      if (result.success) {
        setMigrationResult(result.summary)
        toast({
          title: "Migration Successful",
          description: "All pricing has been updated to realistic Indian market values"
        })
      } else {
        toast({
          title: "Migration Failed",
          description: result.error || "Something went wrong",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Migration error:', error)
      toast({
        title: "Migration Failed",
        description: "Failed to connect to server",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Pricing Migration Tool</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          This tool updates all food items and existing orders to reflect realistic Indian market pricing. 
          This ensures data consistency across user dashboards and admin analytics.
        </p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Run Pricing Migration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">What this migration does:</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Updates all food items with realistic Indian rupee pricing</li>
              <li>• Adjusts existing order history to maintain data consistency</li>
              <li>• Recalculates order totals with proper tax and delivery fees</li>
              <li>• Ensures admin analytics reflect accurate revenue data</li>
            </ul>
          </div>

          <Button 
            onClick={runMigration} 
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running Migration...
              </>
            ) : (
              'Run Pricing Migration'
            )}
          </Button>
        </CardContent>
      </Card>

      {migrationResult && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Package className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{migrationResult.foodItemsUpdated}</p>
                  <p className="text-sm text-muted-foreground">Food Items Updated</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{migrationResult.orderItemsUpdated}</p>
                  <p className="text-sm text-muted-foreground">Order Items Updated</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{migrationResult.ordersUpdated}</p>
                  <p className="text-sm text-muted-foreground">Orders Recalculated</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-8 h-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">₹{migrationResult.totalValueAfter}</p>
                  <p className="text-sm text-muted-foreground">New Total Value</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {migrationResult && (
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Migration Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold">Before Migration</h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-lg font-bold text-red-700">₹{migrationResult.totalValueBefore}</p>
                  <p className="text-sm text-red-600">Old artificial pricing</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">After Migration</h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-lg font-bold text-green-700">₹{migrationResult.totalValueAfter}</p>
                  <p className="text-sm text-green-600">Realistic Indian market pricing</p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-blue-800">Value Change</p>
                  <p className="text-sm text-blue-600">Increase due to realistic pricing</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-700">+₹{migrationResult.valueChange}</p>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    +{migrationResult.percentageChange}%
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Sample Realistic Pricing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Indian Cuisine</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Chicken Biryani</span>
                    <span className="font-medium">₹380</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Butter Chicken</span>
                    <span className="font-medium">₹320</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Palak Paneer</span>
                    <span className="font-medium">₹240</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Pizza & Burgers</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Margherita Pizza</span>
                    <span className="font-medium">₹350</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Truffle Burger</span>
                    <span className="font-medium">₹450</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Classic Cheeseburger</span>
                    <span className="font-medium">₹280</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Beverages</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Cold Coffee</span>
                    <span className="font-medium">₹120</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mango Lassi</span>
                    <span className="font-medium">₹80</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Masala Chai</span>
                    <span className="font-medium">₹40</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}