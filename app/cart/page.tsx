// yumzy/app/cart/page.tsx
'use client';

import { CartView } from './components/CartView';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CartPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Button variant="outline" size="sm" onClick={() => router.back()} className="h-9 sm:h-10">
            <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold">Your Cart</h1>
        </div>
        <CartView />
      </div>
    </div>
  );
}
