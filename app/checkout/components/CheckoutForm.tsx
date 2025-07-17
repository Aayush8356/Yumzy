// yumzy/app/checkout/components/CheckoutForm.tsx
'use client';

import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip: z.string().min(1, 'Zip code is required'),
  cardNumber: z.string().min(1, 'Card number is required'),
  expiryDate: z.string().min(1, 'Expiry date is required'),
  cvv: z.string().min(1, 'CVV is required'),
});

type FormValues = z.infer<typeof formSchema>;

export function CheckoutForm() {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!cart || !user) return;

    try {
      // Format cart items for checkout API
      const cartItems = cart.items.map(item => ({
        foodItemId: item.foodItem.id,
        quantity: item.quantity,
        specialInstructions: item.specialInstructions || ''
      }));

      const customerAddress = `${data.address}, ${data.city}, ${data.state}, ${data.zip}`;

      const response = await fetch('/api/checkout/process', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`
        },
        body: JSON.stringify({
          orderId: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          paymentMethod: 'card',
          amount: cart.summary.total,
          customerDetails: {
            name: user.name || user.email,
            email: user.email,
            phone: user.phone || '123-456-7890',
            address: customerAddress
          },
          cartItems
        }),
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        toast({ title: 'Success', description: 'Order placed successfully!' });
        clearCart();
        router.push(`/track/${result.order.id}`);
      } else {
        toast({ 
          title: 'Error', 
          description: result.error || 'Failed to place order.', 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      console.error('Failed to place order:', error);
      toast({ title: 'Error', description: 'Failed to place order.', variant: 'destructive' });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="address">Address</Label>
          <Input id="address" {...register('address')} />
          {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
        </div>
        <div>
          <Label htmlFor="city">City</Label>
          <Input id="city" {...register('city')} />
          {errors.city && <p className="text-red-500 text-sm">{errors.city.message}</p>}
        </div>
        <div>
          <Label htmlFor="state">State</Label>
          <Input id="state" {...register('state')} />
          {errors.state && <p className="text-red-500 text-sm">{errors.state.message}</p>}
        </div>
        <div>
          <Label htmlFor="zip">Zip Code</Label>
          <Input id="zip" {...register('zip')} />
          {errors.zip && <p className="text-red-500 text-sm">{errors.zip.message}</p>}
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="cardNumber">Card Number</Label>
          <Input id="cardNumber" {...register('cardNumber')} />
          {errors.cardNumber && <p className="text-red-500 text-sm">{errors.cardNumber.message}</p>}
        </div>
        <div>
          <Label htmlFor="expiryDate">Expiry Date</Label>
          <Input id="expiryDate" placeholder="MM/YY" {...register('expiryDate')} />
          {errors.expiryDate && <p className="text-red-500 text-sm">{errors.expiryDate.message}</p>}
        </div>
        <div>
          <Label htmlFor="cvv">CVV</Label>
          <Input id="cvv" {...register('cvv')} />
          {errors.cvv && <p className="text-red-500 text-sm">{errors.cvv.message}</p>}
        </div>
      </div>
      <Button type="submit" className="w-full">Place Order</Button>
    </form>
  );
}