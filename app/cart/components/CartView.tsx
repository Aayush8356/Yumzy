// yumzy/app/cart/components/CartView.tsx
'use client';

import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { QuantityStepper } from '@/app/components/QuantityStepper';
import { ArrowLeft, Loader2 } from 'lucide-react';

export function CartView() {
  const { cart, isLoading, removeFromCart, updateCartItem } = useCart();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 sm:py-12 space-y-4 sm:space-y-6">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-primary" />
          <span className="text-base sm:text-lg">Loading cart...</span>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full max-w-xs sm:max-w-none">
          <Button variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
          <Button onClick={() => router.push('/menu')} className="w-full sm:w-auto">
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 sm:py-12 space-y-4 sm:space-y-6">
        <div className="text-center px-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-600">Add some delicious items to get started!</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full max-w-xs sm:max-w-none">
          <Button variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
          <Button onClick={() => router.push('/menu')} className="w-full sm:w-auto">
            Browse Menu
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
      <div className="lg:col-span-2">
        <div className="space-y-4">
          {cart.items.map((item) => (
            <div key={item.id} className="bg-card rounded-lg border p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <img src={item.foodItem.image} alt={item.foodItem.name} className="w-full sm:w-20 h-32 sm:h-20 object-cover rounded-md" />
                <div className="flex-grow">
                  <h3 className="font-bold text-sm sm:text-base">{item.foodItem.name}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{item.foodItem.shortDescription}</p>
                  <p className="font-bold text-lg sm:text-base mt-1">₹{item.foodItem.price}</p>
                </div>
                <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:gap-2">
                  <QuantityStepper
                    quantity={item.quantity}
                    onQuantityChange={(newQuantity) => {
                      if (newQuantity > 0) {
                        updateCartItem(item.foodItem.id, newQuantity);
                      } else {
                        removeFromCart(item.id);
                      }
                    }}
                  />
                  <Button variant="ghost" size="sm" onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700">
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="lg:sticky lg:top-4">
        <div className="bg-card border rounded-lg p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold mb-4">Order Summary</h2>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between text-sm sm:text-base">
              <span>Subtotal</span>
              <span>₹{cart.summary.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm sm:text-base">
              <span>Tax</span>
              <span>₹{cart.summary.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm sm:text-base">
              <span>Delivery Fee</span>
              <span>₹{cart.summary.deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-base sm:text-lg pt-2 border-t">
              <span>Total</span>
              <span>₹{cart.summary.total.toFixed(2)}</span>
            </div>
          </div>
          <Button className="w-full mt-4" onClick={() => router.push('/checkout')}>
            Proceed to Checkout
          </Button>
        </div>
      </div>
    </div>
  );
}
