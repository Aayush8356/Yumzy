'use client'

import { Button } from '@/components/ui/button'
import { Plus, Minus } from 'lucide-react'

interface QuantityStepperProps {
  quantity: number
  onQuantityChange: (newQuantity: number) => void
  minQuantity?: number
  maxQuantity?: number
}

export function QuantityStepper({ 
  quantity, 
  onQuantityChange, 
  minQuantity = 0, 
  maxQuantity = 99 
}: QuantityStepperProps) {
  const handleIncrement = () => {
    if (quantity < maxQuantity) {
      onQuantityChange(quantity + 1)
    }
  }

  const handleDecrement = () => {
    if (quantity > minQuantity) {
      onQuantityChange(quantity - 1)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleDecrement}
        disabled={quantity <= minQuantity}
        className="h-8 w-8 p-0 hover:bg-primary/20"
      >
        <Minus className="w-4 h-4" />
      </Button>
      <span className="min-w-[2rem] text-center font-medium text-primary">
        {quantity}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={handleIncrement}
        disabled={quantity >= maxQuantity}
        className="h-8 w-8 p-0 hover:bg-primary/20"
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  )
}