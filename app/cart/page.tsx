// yumzy/app/cart/page.tsx
'use client';

import { CartView } from './components/CartView';

export default function CartPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
      <CartView />
    </div>
  );
}
