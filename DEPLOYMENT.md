# Deployment Guide

## 1. GitHub Deployment

### Step 1: Create GitHub Repository
1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `yumzy` (or your preferred name)
3. Keep it public or private as per your preference
4. **DO NOT** initialize with README, .gitignore, or license (we already have these)

### Step 2: Push to GitHub
```bash
# Navigate to your project directory
cd /Users/aayushgupta/Desktop/project/WebFood/Yumzy

# Add all files to git
git add .

# Commit the changes
git commit -m "Initial commit - Yumzy food delivery app

🚀 Features:
- Complete food delivery system
- User authentication & admin dashboard
- Razorpay payment integration
- Real-time order tracking
- Professional UI with animations
- PostgreSQL database with Drizzle ORM

🛡️ Security:
- JWT authentication
- Input validation
- CORS protection
- Environment variables secured

🎨 UI/UX:
- Responsive design
- Dark/light mode
- Professional food imagery
- Smooth animations
- Mobile-optimized

🔧 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"

# Add your GitHub repository as remote origin
git remote add origin https://github.com/yourusername/yumzy.git

# Push to GitHub
git push -u origin main
```

### Step 3: Verify Upload
- Check that all files are uploaded to GitHub
- Verify the README.md displays correctly
- Ensure .env.local is NOT uploaded (should be in .gitignore)

## 2. Vercel Deployment

### Step 1: Connect to Vercel
1. Go to [Vercel](https://vercel.com)
2. Sign in with your GitHub account
3. Click "New Project"
4. Import your `yumzy` repository

### Step 2: Configure Build Settings
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: Leave empty (default)
- **Install Command**: `npm install`

### Step 3: Environment Variables
Add these environment variables in Vercel dashboard:

```bash
# Database
DATABASE_URL=your-postgresql-url
POSTGRES_URL=your-postgresql-url

# Authentication
JWT_SECRET=your-jwt-secret-key

# Payments
NEXT_PUBLIC_RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-secret-key
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret

# Images
UNSPLASH_ACCESS_KEY=your-unsplash-access-key
UNSPLASH_SECRET_KEY=your-unsplash-secret-key

# Demo Data (optional)
ENABLE_DEMO_DATA=true
```

### Step 4: Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Your app will be live at `https://your-project-name.vercel.app`

## 3. Supabase Database Setup

### Step 1: Create Supabase Project
1. Go to [Supabase](https://supabase.com)
2. Click "New Project"
3. Choose organization and project name
4. Select region (closest to your users)
5. Create strong database password
6. Wait for project to be ready

### Step 2: Get Database URL
1. Go to Project Settings → Database
2. Copy the connection string
3. Replace `[YOUR-PASSWORD]` with your actual password
4. Format: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

### Step 3: Run Database Migrations
```bash
# Install dependencies
npm install

# Set your DATABASE_URL in .env.local
DATABASE_URL=your-supabase-connection-string

# Generate and run migrations
npm run db:generate
npm run db:migrate

# Seed the database with demo data
npm run db:seed
```

### Step 4: Configure Supabase Features

#### Enable Row Level Security (RLS)
```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
```

#### Create Policies
```sql
-- Users can only see their own data
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id::text);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id::text);

-- Orders policies
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id::text);
CREATE POLICY "Users can create own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id::text);

-- Add similar policies for other tables...
```

### Step 5: Supabase Dashboard Features

#### Authentication
- Go to Authentication → Settings
- Configure email templates
- Set up social providers (Google, Facebook, etc.)
- Configure JWT settings

#### Database
- Use SQL Editor for custom queries
- Monitor database performance
- Set up backups
- View table relationships

#### Storage (Optional)
- Create buckets for file uploads
- Configure policies for user uploads
- Set up CDN for images

#### Edge Functions (Optional)
- Deploy serverless functions
- Handle webhooks
- Process background tasks

### Step 6: Production Optimizations

#### Database Indexing
```sql
-- Add indexes for better performance
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_menu_items_category ON menu_items(category);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
```

#### Connection Pooling
- Enable connection pooling in Supabase
- Configure pool size based on your needs
- Monitor connection usage

#### Monitoring
- Set up alerts for database performance
- Monitor query performance
- Track user activity

## 4. Post-Deployment Checklist

### Testing
- [ ] User registration/login works
- [ ] Menu items load correctly
- [ ] Cart functionality works
- [ ] Payment flow completes
- [ ] Order tracking updates
- [ ] Admin dashboard accessible
- [ ] Email notifications sent
- [ ] Database queries optimized

### Security
- [ ] Environment variables secured
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Input validation working
- [ ] SQL injection protection
- [ ] XSS protection enabled

### Performance
- [ ] Images optimized
- [ ] Database queries optimized
- [ ] Caching implemented
- [ ] CDN configured
- [ ] Bundle size optimized

### Monitoring
- [ ] Error tracking setup
- [ ] Performance monitoring
- [ ] User analytics
- [ ] Database monitoring
- [ ] Uptime monitoring

## 5. Maintenance

### Regular Tasks
- Monitor database performance
- Update dependencies
- Review error logs
- Backup database
- Update security patches

### Scaling
- Monitor user growth
- Optimize database queries
- Consider read replicas
- Implement caching layer
- Add CDN for static assets

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review Supabase database logs
3. Verify environment variables
4. Test API endpoints
5. Check browser console for errors

Your Yumzy app is now ready for production! 🚀