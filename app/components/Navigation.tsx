'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/ui/theme-provider'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { SignInModal } from '@/components/modals/SignInModal'
import { CartModal } from '@/components/modals/CartModal'
import { ProfessionalNotificationCenter } from '@/components/ProfessionalNotificationCenter'
import { Menu, X, User, ShoppingCart, Moon, Sun, LogOut, Settings, Package } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [showSignIn, setShowSignIn] = useState(false)
  const [showCart, setShowCart] = useState(false)
  const { theme, setTheme } = useTheme()
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const { cart } = useCart()
  const router = useRouter()
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true
    if (path !== '/' && pathname.startsWith(path)) return true
    return false
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const smoothScroll = (elementId: string) => {
    const element = document.getElementById(elementId)
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
      setIsOpen(false) // Close mobile menu
    }
  }

  const handleLogoClick = () => {
    // Role-based homepage redirect
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/')
      }
    } else {
      router.push('/')
    }
  }

  return (
    <>
      <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-xl border-b z-50 gpu-accelerated">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <motion.div 
              className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              onClick={handleLogoClick}
            >
              <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">Y</span>
              </div>
              <span className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                Yumzy
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link 
                href="/" 
                className={`transition-colors font-medium relative ${
                  isActive('/') 
                    ? 'text-primary' 
                    : 'text-foreground hover:text-primary'
                }`}
              >
                Home
                {isActive('/') && (
                  <motion.div
                    layoutId="activeDesktop"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
              <Link 
                href="/menu" 
                className={`transition-colors font-medium relative ${
                  isActive('/menu') 
                    ? 'text-primary' 
                    : 'text-foreground hover:text-primary'
                }`}
              >
                Menu
                {isActive('/menu') && (
                  <motion.div
                    layoutId="activeDesktop"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
              <Link 
                href="/about" 
                className={`transition-colors font-medium relative ${
                  isActive('/about') 
                    ? 'text-primary' 
                    : 'text-foreground hover:text-primary'
                }`}
              >
                About
                {isActive('/about') && (
                  <motion.div
                    layoutId="activeDesktop"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
              <Link 
                href="/contact" 
                className={`transition-colors font-medium relative ${
                  isActive('/contact') 
                    ? 'text-primary' 
                    : 'text-foreground hover:text-primary'
                }`}
              >
                Contact
                {isActive('/contact') && (
                  <motion.div
                    layoutId="activeDesktop"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
              {isAuthenticated && (
                <Link 
                  href={user?.role === 'admin' ? '/admin' : '/dashboard'}
                  className={`transition-colors font-medium relative ${
                    (user?.role === 'admin' ? isActive('/admin') : isActive('/dashboard'))
                      ? 'text-primary' 
                      : 'text-foreground hover:text-primary'
                  }`}
                >
                  Dashboard
                  {(user?.role === 'admin' ? isActive('/admin') : isActive('/dashboard')) && (
                    <motion.div
                      layoutId="activeDesktop"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              )}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={toggleTheme}
                className="hover:bg-accent"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              
              {!isLoading && isAuthenticated && <ProfessionalNotificationCenter />}
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative"
                onClick={() => {
                  if (isAuthenticated) {
                    setShowCart(true)
                  } else {
                    router.push('/auth/login')
                  }
                }}
              >
                <ShoppingCart className="h-4 w-4" />
                {!isLoading && isAuthenticated && cart && cart.summary.totalQuantity > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cart.summary.totalQuantity}
                  </span>
                )}
              </Button>
              
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-muted animate-pulse"></div>
                </div>
              ) : isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.avatar} alt={user?.name} />
                        <AvatarFallback>
                          {user?.name?.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link 
                        href={user?.role === 'admin' ? '/admin' : '/dashboard'} 
                        className={(user?.role === 'admin' ? isActive('/admin') : isActive('/dashboard')) ? 'text-primary font-medium' : ''}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className={isActive('/profile') ? 'text-primary font-medium' : ''}>
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/orders" className={isActive('/orders') ? 'text-primary font-medium' : ''}>
                        <Package className="mr-2 h-4 w-4" />
                        Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    asChild
                  >
                    <Link href="/auth/login">
                      <User className="h-4 w-4 mr-2" />
                      Sign In
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="px-6"
                    asChild
                  >
                    <Link href="/menu">
                      Order Now
                    </Link>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={toggleTheme}
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              
              {!isLoading && isAuthenticated && <ProfessionalNotificationCenter />}
              
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => {
                  if (isAuthenticated) {
                    setShowCart(true)
                  } else {
                    router.push('/auth/login')
                  }
                }}
              >
                <ShoppingCart className="h-4 w-4" />
                {!isLoading && isAuthenticated && cart && cart.summary.totalQuantity > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                    {cart.summary.totalQuantity}
                  </span>
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div 
            className="md:hidden bg-background/95 backdrop-blur-xl border-t"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="px-4 pt-2 pb-3 space-y-1">
              <Link 
                href="/"
                onClick={() => setIsOpen(false)}
                className={`block w-full text-left px-3 py-2 rounded-md transition-colors ${
                  isActive('/') 
                    ? 'text-primary bg-primary/10 font-medium' 
                    : 'text-foreground hover:text-primary hover:bg-accent'
                }`}
              >
                Home
              </Link>
              <Link 
                href="/menu"
                onClick={() => setIsOpen(false)}
                className={`block w-full text-left px-3 py-2 rounded-md transition-colors ${
                  isActive('/menu') 
                    ? 'text-primary bg-primary/10 font-medium' 
                    : 'text-foreground hover:text-primary hover:bg-accent'
                }`}
              >
                Menu
              </Link>
              <Link 
                href="/about"
                onClick={() => setIsOpen(false)}
                className={`block w-full text-left px-3 py-2 rounded-md transition-colors ${
                  isActive('/about') 
                    ? 'text-primary bg-primary/10 font-medium' 
                    : 'text-foreground hover:text-primary hover:bg-accent'
                }`}
              >
                About
              </Link>
              <Link 
                href="/contact"
                onClick={() => setIsOpen(false)}
                className={`block w-full text-left px-3 py-2 rounded-md transition-colors ${
                  isActive('/contact') 
                    ? 'text-primary bg-primary/10 font-medium' 
                    : 'text-foreground hover:text-primary hover:bg-accent'
                }`}
              >
                Contact
              </Link>
              
              {!isLoading && isAuthenticated && (
                <Link 
                  href={user?.role === 'admin' ? '/admin' : '/dashboard'}
                  onClick={() => setIsOpen(false)}
                  className={`block w-full text-left px-3 py-2 rounded-md transition-colors ${
                    (user?.role === 'admin' ? isActive('/admin') : isActive('/dashboard'))
                      ? 'text-primary bg-primary/10 font-medium' 
                      : 'text-foreground hover:text-primary hover:bg-accent'
                  }`}
                >
                  Dashboard
                </Link>
              )}
              
              {isLoading ? (
                <div className="space-y-2 pt-4">
                  <div className="flex items-center space-x-3 px-3 py-2">
                    <div className="h-8 w-8 rounded-full bg-muted animate-pulse"></div>
                    <div>
                      <div className="h-4 w-20 bg-muted rounded animate-pulse mb-1"></div>
                      <div className="h-3 w-32 bg-muted rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ) : isAuthenticated ? (
                <div className="space-y-2 pt-4">
                  <div className="flex items-center space-x-3 px-3 py-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback>
                        {user?.name?.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  
                  <Link 
                    href="/profile"
                    onClick={() => setIsOpen(false)}
                    className={`block w-full text-left px-3 py-2 rounded-md transition-colors ${
                      isActive('/profile') 
                        ? 'text-primary bg-primary/10 font-medium' 
                        : 'text-foreground hover:text-primary hover:bg-accent'
                    }`}
                  >
                    Profile
                  </Link>
                  <Link 
                    href="/orders"
                    onClick={() => setIsOpen(false)}
                    className={`block w-full text-left px-3 py-2 rounded-md transition-colors ${
                      isActive('/orders') 
                        ? 'text-primary bg-primary/10 font-medium' 
                        : 'text-foreground hover:text-primary hover:bg-accent'
                    }`}
                  >
                    Orders
                  </Link>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      logout()
                      setIsOpen(false)
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="flex space-x-2 pt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    asChild
                  >
                    <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                      <User className="h-4 w-4 mr-2" />
                      Sign In
                    </Link>
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="flex-1"
                    asChild
                  >
                    <Link href="/menu" onClick={() => setIsOpen(false)}>
                      Order Now
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </nav>

      {/* Modals */}
      <SignInModal isOpen={showSignIn} onClose={() => setShowSignIn(false)} />
      <CartModal isOpen={showCart} onClose={() => setShowCart(false)} />
    </>
  )
}