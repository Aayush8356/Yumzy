// yumzy/app/cart/components/CartView.tsx
'use client';

import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { QuantityStepper } from '@/app/components/QuantityStepper';

export function CartView() {
  const { cart, isLoading, removeFromCart, updateCartItem } = useCart();
  const router = useRouter();

  if (isLoading) {
    return <div>Loading cart...</div>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div>
        <p>Your cart is empty.</p>
        <Button onClick={() => router.push('/menu')}>Continue Shopping</Button>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        {cart.items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 mb-4">
            <img src={item.foodItem.image} alt={item.foodItem.name} className="w-24 h-24 object-cover rounded-md" />
            <div className="flex-grow">
              <h3 className="font-bold">{item.foodItem.name}</h3>
              <p className="text-sm text-muted-foreground">{item.foodItem.shortDescription}</p>
              <p className="font-bold">₹{item.foodItem.price}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
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
              <Button variant="ghost" size="sm" onClick={() => removeFromCart(item.id)}>
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div>
        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{cart.summary.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>₹{cart.summary.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span>₹{cart.summary.deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
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
