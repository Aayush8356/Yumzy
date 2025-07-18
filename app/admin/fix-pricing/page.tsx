'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

// Items that need price fixes based on the database screenshot
const itemsToFix = [
  { name: 'Beef Pho', currentPrice: '17.99', newPrice: '280', originalPrice: '350', discount: 20 },
  { name: 'Beef Bourguignon', currentPrice: '28.99', newPrice: '450', originalPrice: '550', discount: 18 },
  { name: 'Marinated Beef Bulgogi', currentPrice: '18.99', newPrice: '380', originalPrice: '450', discount: 16 },
  { name: 'Beef Ramen', currentPrice: '15.99', newPrice: '340', originalPrice: '420', discount: 19 },
  { name: 'Pho Tai', currentPrice: '15.99', newPrice: '290', originalPrice: '360', discount: 19 },
  { name: 'Thai Basil Beef', currentPrice: '18.99', newPrice: '320', originalPrice: '390', discount: 18 },
  { name: 'Mango Lassi', currentPrice: '10.99', newPrice: '80', originalPrice: '100', discount: 20 },
  { name: 'Lemongrass Chicken', currentPrice: '19.99', newPrice: '310', originalPrice: '380', discount: 18 },
  { name: 'Schnitzel', currentPrice: '22.99', newPrice: '380', originalPrice: '460', discount: 17 },
  { name: 'Pao de Acucar', currentPrice: '8.99', newPrice: '150', originalPrice: '180', discount: 17 },
]

export default function FixPricingPage() {
  const [fixedItems, setFixedItems] = useState<string[]>([])
  const [isFixing, setIsFixing] = useState(false)
  const [customUpdates, setCustomUpdates] = useState<Array<{name: string, price: string, originalPrice: string}>>([])

  const addCustomUpdate = () => {
    setCustomUpdates([...customUpdates, { name: '', price: '', originalPrice: '' }])
  }

  const updateCustomItem = (index: number, field: string, value: string) => {
    const updated = [...customUpdates]
    updated[index] = { ...updated[index], [field]: value }
    setCustomUpdates(updated)
  }

  const removeCustomUpdate = (index: number) => {
    setCustomUpdates(customUpdates.filter((_, i) => i !== index))
  }

  const fixAllPricing = async () => {
    setIsFixing(true)
    let successCount = 0
    let failCount = 0

    try {
      // Process predefined items
      for (const item of itemsToFix) {
        try {
          const response = await fetch('/api/menu', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer admin-token'
            },
            body: JSON.stringify({
              action: 'updatePricing',
              itemName: item.name,
              price: item.newPrice,
              originalPrice: item.originalPrice,
              discount: item.discount
            })
          })

          if (response.ok) {
            setFixedItems(prev => [...prev, item.name])
            successCount++
          } else {
            failCount++
          }
        } catch (error) {
          console.error(`Error fixing ${item.name}:`, error)
          failCount++
        }
      }

      // Process custom updates
      for (const item of customUpdates) {
        if (item.name && item.price) {
          try {
            const response = await fetch('/api/menu', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer admin-token'
              },
              body: JSON.stringify({
                action: 'updatePricing',
                itemName: item.name,
                price: item.price,
                originalPrice: item.originalPrice || (parseFloat(item.price) * 1.25).toString(),
                discount: 20
              })
            })

            if (response.ok) {
              setFixedItems(prev => [...prev, item.name])
              successCount++
            } else {
              failCount++
            }
          } catch (error) {
            console.error(`Error fixing ${item.name}:`, error)
            failCount++
          }
        }
      }

      if (successCount > 0) {
        toast({
          title: "Pricing Updated!",
          description: `Successfully updated ${successCount} items. ${failCount > 0 ? `${failCount} items failed.` : ''}`
        })
      } else {
        toast({
          title: "Update Failed",
          description: "Could not update pricing. Please try manual updates.",
          variant: "destructive"
        })
      }

    } catch (error) {
      console.error('Error fixing pricing:', error)
      toast({
        title: "Error",
        description: "Failed to update pricing",
        variant: "destructive"
      })
    } finally {
      setIsFixing(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Fix Remaining Price Issues</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Update remaining food items that still have unrealistic pricing (items with .99, .89 patterns or very low prices)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Predefined Items to Fix */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              Items Needing Price Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {itemsToFix.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {fixedItems.includes(item.name) ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-orange-500" />
                    )}
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        {item.currentPrice} → ₹{item.newPrice}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">₹{item.originalPrice}</p>
                    <p className="text-xs text-green-600">{item.discount}% off</p>
                  </div>
                </div>
              ))}
            </div>

            <Button 
              onClick={fixAllPricing} 
              disabled={isFixing}
              className="w-full mt-4"
              size="lg"
            >
              {isFixing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Fixing Pricing...
                </>
              ) : (
                'Fix All Pricing Issues'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Custom Updates */}
        <Card>
          <CardHeader>
            <CardTitle>Custom Price Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {customUpdates.map((item, index) => (
                <div key={index} className="grid grid-cols-3 gap-2 p-3 bg-gray-50 rounded-lg">
                  <div>
                    <Label className="text-xs">Item Name</Label>
                    <Input
                      placeholder="Item name"
                      value={item.name}
                      onChange={(e) => updateCustomItem(index, 'name', e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Price (₹)</Label>
                    <Input
                      type="number"
                      placeholder="280"
                      value={item.price}
                      onChange={(e) => updateCustomItem(index, 'price', e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Original (₹)</Label>
                    <div className="flex gap-1">
                      <Input
                        type="number"
                        placeholder="350"
                        value={item.originalPrice}
                        onChange={(e) => updateCustomItem(index, 'originalPrice', e.target.value)}
                        className="h-8"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeCustomUpdate(index)}
                        className="h-8 px-2"
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              <Button
                variant="outline"
                onClick={addCustomUpdate}
                className="w-full"
              >
                Add Custom Update
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Manual Database Update (Alternative)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">
              If the automated fix doesn't work, you can manually update the database with these SQL queries:
            </p>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
{`-- Update specific items
UPDATE food_items SET price = '280', original_price = '350', discount = 20 WHERE name = 'Beef Pho';
UPDATE food_items SET price = '450', original_price = '550', discount = 18 WHERE name = 'Beef Bourguignon';
UPDATE food_items SET price = '380', original_price = '450', discount = 16 WHERE name = 'Marinated Beef Bulgogi';
UPDATE food_items SET price = '340', original_price = '420', discount = 19 WHERE name = 'Beef Ramen';
UPDATE food_items SET price = '290', original_price = '360', discount = 19 WHERE name = 'Pho Tai';
UPDATE food_items SET price = '320', original_price = '390', discount = 18 WHERE name = 'Thai Basil Beef';
UPDATE food_items SET price = '80', original_price = '100', discount = 20 WHERE name = 'Mango Lassi';
UPDATE food_items SET price = '310', original_price = '380', discount = 18 WHERE name = 'Lemongrass Chicken';

-- Update all items with decimal patterns
UPDATE food_items SET 
    price = CASE 
        WHEN CAST(price AS DECIMAL) < 50 THEN CAST((CAST(price AS DECIMAL) * 15) AS VARCHAR)
        WHEN price LIKE '%.99' THEN CAST((CAST(REPLACE(price, '.99', '') AS DECIMAL) * 20) AS VARCHAR)
        ELSE price
    END,
    updated_at = NOW()
WHERE CAST(price AS DECIMAL) < 50 OR price LIKE '%.99' OR price LIKE '%.89';`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}