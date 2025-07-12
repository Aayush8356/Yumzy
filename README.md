# Yumzy - Food Delivery App

A modern, full-featured food delivery application built with Next.js and TypeScript.

## Features

- **User Authentication**: Secure login/registration with email verification
- **Email System**: Gmail App Password integration for reliable email delivery
- **Menu Management**: Browse categorized food items with professional images
- **Cart & Checkout**: Add items to cart with Razorpay payment integration
- **Order Tracking**: Real-time order status updates
- **Favorites**: Save your favorite dishes
- **Admin Dashboard**: Comprehensive analytics and management tools
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Real-time Notifications**: Stay updated on order status
- **Professional UI**: Clean, modern interface with smooth animations
- **Production Ready**: Complete with caching, monitoring, and testing

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, Shadcn/ui components
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT-based authentication with email verification
- **Email**: Gmail App Password support (+ SendGrid, custom SMTP)
- **Payment**: Razorpay integration
- **Images**: Unsplash API for food images
- **Caching**: Redis with in-memory fallback
- **Monitoring**: Error tracking and performance monitoring
- **Testing**: Jest with comprehensive test coverage
- **Deployment**: Vercel-ready with CI/CD pipeline

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- Razorpay account (for payments)
- Unsplash API key (for images)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/yumzy.git
cd yumzy
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Fill in your database URL, JWT secret, Razorpay keys, and Unsplash API key in `.env.local`.

4. Set up the database:
```bash
npm run db:push
npm run db:seed
```

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Environment Variables

See `.env.example` for all required environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for JWT token generation
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`: Razorpay public key
- `RAZORPAY_KEY_SECRET`: Razorpay secret key
- `UNSPLASH_ACCESS_KEY`: Unsplash API access key

## Project Structure

```
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   ├── components/     # Reusable components
│   ├── contexts/       # React contexts
│   └── [pages]/        # Application pages
├── lib/                # Utility functions and configurations
├── public/             # Static assets
└── drizzle/           # Database migrations and schema
```

## Demo Accounts

The application includes demo accounts for testing:

- **Admin**: admin@demo.com / demo123
- **Customer**: customer@demo.com / demo123

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.