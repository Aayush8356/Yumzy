#!/bin/bash

echo "Setting up Vercel environment variables..."

# Database URLs
echo "Setting DATABASE_URL..."
echo "postgresql://postgres:Aayush%401076@db.bnigaokzunwsfaijkzva.supabase.co:5432/postgres" | vercel env add DATABASE_URL production

echo "Setting POSTGRES_URL..."
echo "postgresql://postgres:Aayush%401076@db.bnigaokzunwsfaijkzva.supabase.co:5432/postgres" | vercel env add POSTGRES_URL production

echo "Setting NODE_ENV..."
echo "production" | vercel env add NODE_ENV production

echo "Setting NEXT_PUBLIC_APP_URL..."
echo "https://yumzy-aayush8356s-projects.vercel.app" | vercel env add NEXT_PUBLIC_APP_URL production

echo "Setting JWT_SECRET..."
echo "your-super-secret-jwt-key-for-yumzy-app-2024" | vercel env add JWT_SECRET production

echo "Setting UNSPLASH_ACCESS_KEY..."
echo "kWDk-NvD5EmOwEX1ff54RVExiWbGEW9qpuIs0wSvZGY" | vercel env add UNSPLASH_ACCESS_KEY production

echo "Setting UNSPLASH_SECRET_KEY..."
echo "_qo9Pp_VvReY2a_tKJSu37uzM_RwLCqYefhChBdI5Qs" | vercel env add UNSPLASH_SECRET_KEY production

echo "Setting NEXT_PUBLIC_RAZORPAY_KEY_ID..."
echo "rzp_live_Id6ureskMPEgy9" | vercel env add NEXT_PUBLIC_RAZORPAY_KEY_ID production

echo "Setting RAZORPAY_KEY_SECRET..."
echo "5DswpMfZj6Xcqg2fJMFfxK3W" | vercel env add RAZORPAY_KEY_SECRET production

echo "All environment variables set! Now redeploying..."
vercel --prod

echo "Deployment complete!"