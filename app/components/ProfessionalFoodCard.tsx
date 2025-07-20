'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Star, Clock, Heart, Info, Leaf, Award, Zap, Plus, Minus, ShoppingCart } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useToast } from '@/hooks/use-toast'
import ProfessionalFoodImage from '@/components/ProfessionalFoodImage'
import { useAuth } from '@/contexts/AuthContext'

interface FoodItem {
  id: string
  name: string
  description: string
  shortDescription: string
  price: string
  originalPrice?: string
  discount?: number
  rating: string
  reviewCount: number
  cookTime: string
  difficulty: string
  spiceLevel: number
  servingSize: string
  calories: number
  image: string
  images: string[]
  optimizedImage?: string
  fallbackImage?: string
  professionalCategories?: string[]
  ingredients: string[]
  allergens: string[]
  nutritionInfo: {
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber: number
    sugar: number
  }
  tags: string[]
  isVegetarian: boolean
  isVegan: boolean
  isGlutenFree: boolean
  isSpicy: boolean
  isPopular: boolean
  category: {
    id: string
    name: string
    description: string
    image: string
  }
}

interface ProfessionalFoodCardProps {
  item: FoodItem
  index?: number
  onFavoriteRemoved?: () => void
  isFavorited?: boolean
}

// Fallback image pool for when API fails
const fallbackImagePool = [
  'https://images.unsplash.com/photo-1563379091339-03246963d638?w=400&h=300&fit=crop&crop=center', // biryani
  'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop&crop=center', // pizza
  'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop&crop=center', // ramen
  'https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8?w=400&h=300&fit=crop&crop=center', // burger
  'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=300&fit=crop&crop=center', // tacos
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop&crop=center', // salad
  'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop&crop=center', // cake
  'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop&crop=center', // coffee
]

// Generate fallback image for when API fails
const generateFallbackImage = (item: FoodItem): string => {
  const generateIndex = (id: string, name: string): number => {
    let hash = 0
    const str = id + name
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash) % fallbackImagePool.length
  }
  
  const imageIndex = generateIndex(item.id, item.name)
  return fallbackImagePool[imageIndex]
}

export function ProfessionalFoodCard({ item, index = 0, onFavoriteRemoved, isFavorited = false }: ProfessionalFoodCardProps) {
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null)
  const [isLiked, setIsLiked] = useState(isFavorited);
  const [imageUrl, setImageUrl] = useState<string>(generateFallbackImage(item));
  const [isLoadingImage, setIsLoadingImage] = useState(true);
  const { addToCart, getItemQuantity, updateCartItem, cart, removeFromCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const currentQuantity = getItemQuantity(item.id);

  useEffect(() => {
    // If isFavorited prop is provided, use it (for favorites page)
    if (isFavorited !== undefined) {
      setIsLiked(isFavorited);
      return;
    }
    
    // Otherwise, check from API (for menu page)
    const checkIfFavorite = async () => {
      if (!user) return;
      try {
        const authToken = localStorage.getItem('authToken');
        if (!authToken) return;
        
        const response = await fetch('/api/favorites', {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        if (data.success) {
          const isFavorited = data.favorites.some((fav: any) => fav.foodItemId === item.id);
          setIsLiked(isFavorited);
        }
      } catch (error) {
        console.error("Failed to check favorite status:", error);
      }
    };
    checkIfFavorite();
  }, [user, item.id, isFavorited]);

  // Fetch contextual image from Unsplash API
  useEffect(() => {
    const fetchImage = async () => {
      try {
        setIsLoadingImage(true);
        const response = await fetch(
          `/api/images/food?name=${encodeURIComponent(item.name)}&category=${encodeURIComponent(item.category?.name || '')}&id=${encodeURIComponent(item.id)}`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.imageUrl) {
            setImageUrl(data.imageUrl);
          }
        }
      } catch (error) {
        console.error('Failed to fetch contextual image:', error);
      } finally {
        setIsLoadingImage(false);
      }
    };

    fetchImage();
  }, [item.id, item.name, item.category?.name]);

  const handleLike = async () => {
    if (!user) {
      toast({ title: "Please sign in", description: "You need to be logged in to save favorites." });
      return;
    }

    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      toast({ title: "Authentication required", description: "Please log in again." });
      return;
    }

    const newLikedState = !isLiked;
    setIsLiked(newLikedState);

    try {
      const response = await fetch('/api/favorites', {
        method: newLikedState ? 'POST' : 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ foodItemId: item.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Revert state if API call fails
        setIsLiked(!newLikedState);
        toast({ 
          title: "Error", 
          description: data.error || "Could not update favorites.", 
          variant: "destructive" 
        });
      } else {
        // Success - show confirmation
        toast({ 
          title: newLikedState ? "Added to favorites" : "Removed from favorites",
          description: newLikedState ? "Item added to your favorites." : "Item removed from your favorites."
        });
        
        // If item was removed from favorites and we have a callback, call it
        if (!newLikedState && onFavoriteRemoved) {
          onFavoriteRemoved();
        }
      }
    } catch (error) {
      setIsLiked(!newLikedState);
      toast({ title: "Error", description: "Could not update favorites.", variant: "destructive" });
    }
  };

  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleAddToCart = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be logged in to add items to cart",
        variant: "destructive"
      });
      return;
    }

    if (isAdding) return; // Prevent double clicks

    try {
      setIsAdding(true);
      const success = await addToCart(item.id, 1);
      
      // Clear isAdding quickly for better UX
      setIsAdding(false);
      
      if (success) {
        toast({
          title: "Added to cart",
          description: `${item.name} has been added to your cart`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add item to cart. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      setIsAdding(false);
      toast({
        title: "Error", 
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleQuantityChange = async (newQuantity: number) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be logged in to modify cart",
        variant: "destructive"
      });
      return;
    }

    if (newQuantity > 0) {
      setIsUpdating(true);
      try {
        await updateCartItem(item.id, newQuantity);
      } catch (error) {
        // Error handling is done in cart context
      } finally {
        // Clear loading state after a brief delay to show feedback
        setTimeout(() => setIsUpdating(false), 200);
      }
    }
  }

  const handleRemoveFromCart = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be logged in to modify cart",
        variant: "destructive"
      });
      return;
    }

    setIsUpdating(true);
    try {
      // Find the cart item to get its cart ID
      const cartItem = cart?.items.find(cartItem => cartItem.foodItem.id === item.id);
      if (cartItem) {
        const success = await removeFromCart(cartItem.id);
        if (success) {
          // Don't show success toast - cart context handles feedback
          console.log(`${item.name} removed from cart`);
        } else {
          // Only show error if removal actually failed
          toast({
            title: "Failed to remove item",
            description: "Please try again.",
            variant: "destructive"
          });
        }
      } else {
        // Item not in cart - this is actually fine, just log it
        console.log('Item not found in cart, probably already removed');
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast({
        title: "Error",
        description: "Failed to remove item from cart. Please try again.",
        variant: "destructive"
      });
    } finally {
      // Clear loading state after a brief delay to show feedback
      setTimeout(() => setIsUpdating(false), 200);
    }
  }

  const handleIncrement = async () => {
    await handleQuantityChange(currentQuantity + 1)
  }

  const handleDecrement = async () => {
    if (currentQuantity > 1) {
      await handleQuantityChange(currentQuantity - 1)
    } else if (currentQuantity === 1) {
      // Remove item entirely when quantity would go below 1
      await handleRemoveFromCart()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.05 }}
    >
      <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-0 shadow-md hover:shadow-2xl">
        <div className="relative">
          <ProfessionalFoodImage
            src={imageUrl}
            alt={item.name}
            width={400}
            height={240}
            className={`w-full h-60 object-cover group-hover:scale-105 transition-transform duration-300 ${isLoadingImage ? 'opacity-75' : 'opacity-100'}`}
            professionalCategories={item.professionalCategories || []}
            priority={index < 4}
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {!!item.isPopular && (
              <Badge className="bg-red-500 hover:bg-red-600 text-white text-xs font-medium">
                <Award className="w-3 h-3 mr-1" />
                Bestseller
              </Badge>
            )}
            {!!(item.discount && item.discount > 0) && (
              <Badge className="bg-green-500 hover:bg-green-600 text-white text-xs font-medium">
                {item.discount}% OFF
              </Badge>
            )}
          </div>

          {/* Dietary badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-1">
            {!!item.isVegetarian && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs border border-green-200">
                <Leaf className="w-3 h-3 mr-1" />
                Veg
              </Badge>
            )}
            {!!item.isVegan && (
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 text-xs border border-emerald-200">
                🌱 Vegan
              </Badge>
            )}
            {!!item.isSpicy && (
              <Badge variant="secondary" className="bg-red-100 text-red-800 text-xs border border-red-200">
                <Zap className="w-3 h-3 mr-1" />
                Spicy
              </Badge>
            )}
          </div>
          
          {/* Heart button */}
          <Button
            variant="secondary"
            size="sm"
            className={`absolute bottom-3 right-3 rounded-full w-8 h-8 p-0 ${
              isLiked ? 'bg-red-100 text-red-600' : 'bg-white/90 text-gray-600'
            }`}
            onClick={handleLike}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </Button>
        </div>
        
        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-bold text-lg leading-tight mb-1 group-hover:text-primary transition-colors">
                {item.name}
              </h3>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{item.rating}</span>
                  {!!(item.reviewCount > 0) && <span>({item.reviewCount})</span>}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{item.cookTime}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2 leading-relaxed">
            {item.shortDescription || item.description}
          </p>

          {/* Price Section */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl font-bold text-green-600">
              {item.price}
            </span>
            {!!item.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {item.originalPrice}
              </span>
            )}
          </div>

          {/* Actions Section */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {/* Info Dialog */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => setSelectedItem(item)}>
                    <Info className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-full max-w-[350px] sm:max-w-md lg:max-w-2xl h-[92vh] sm:h-auto sm:max-h-[85vh] overflow-hidden m-0 sm:m-4 rounded-none sm:rounded-lg border-0 sm:border p-0">
                  <DialogHeader className="flex-shrink-0 p-3 pb-2 border-b bg-background">
                    <DialogTitle className="text-sm font-semibold pr-8 line-clamp-1 leading-tight">{item.name}</DialogTitle>
                  </DialogHeader>
                  {selectedItem && (
                    <div className="flex flex-col h-full bg-background">
                      {/* Hot Deal Banner */}
                      {selectedItem.discount && (
                        <div className="flex-shrink-0 bg-gradient-to-r from-orange-500 to-red-500 p-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🔥</span>
                            <div>
                              <div className="text-white text-xs font-semibold">Today's Hot Deal!</div>
                              <div className="text-white/90 text-[10px]">{selectedItem.name} is {selectedItem.discount}% off today only! Limited time offer.</div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Optimized Image Section */}
                      <div className="flex-shrink-0 relative w-full h-40 sm:h-48">
                        <ProfessionalFoodImage
                          src={imageUrl}
                          alt={selectedItem.name}
                          width={400}
                          height={200}
                          className="absolute inset-0 w-full h-full object-cover"
                          professionalCategories={selectedItem.professionalCategories || []}
                          priority={true}
                        />
                        {/* Overlay nutrition quick stats */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                          <div className="grid grid-cols-4 gap-2 text-center text-white text-xs">
                            <div>
                              <div className="font-bold">{selectedItem.nutritionInfo.calories}</div>
                              <div className="text-[10px] opacity-80">cal</div>
                            </div>
                            <div>
                              <div className="font-bold">{selectedItem.nutritionInfo.protein}g</div>
                              <div className="text-[10px] opacity-80">protein</div>
                            </div>
                            <div>
                              <div className="font-bold">{selectedItem.cookTime}</div>
                              <div className="text-[10px] opacity-80">time</div>
                            </div>
                            <div>
                              <div className="font-bold">{selectedItem.servingSize}</div>
                              <div className="text-[10px] opacity-80">serving</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Detailed Content */}
                      <div className="flex-1 p-3 space-y-3 overflow-y-auto scrollbar-hide">
                        {/* Description */}
                        <div>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            {selectedItem.description}
                          </p>
                        </div>
                        
                        {/* Complete Nutrition Info */}
                        <div className="bg-muted/20 p-3 rounded-lg">
                          <h4 className="font-semibold mb-2 text-sm">Complete Nutrition Facts</h4>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Calories:</span>
                              <span className="font-medium">{selectedItem.nutritionInfo.calories}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Protein:</span>
                              <span className="font-medium">{selectedItem.nutritionInfo.protein}g</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Carbs:</span>
                              <span className="font-medium">{selectedItem.nutritionInfo.carbs}g</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Fat:</span>
                              <span className="font-medium">{selectedItem.nutritionInfo.fat}g</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Fiber:</span>
                              <span className="font-medium">{selectedItem.nutritionInfo.fiber}g</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Sugar:</span>
                              <span className="font-medium">{selectedItem.nutritionInfo.sugar}g</span>
                            </div>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="bg-muted/20 p-3 rounded-lg">
                          <h4 className="font-semibold mb-2 text-sm">Details & Info</h4>
                          <div className="grid grid-cols-1 gap-1.5 text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Serving Size:</span>
                              <span className="font-medium">{selectedItem.servingSize}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Cook Time:</span>
                              <span className="font-medium">{selectedItem.cookTime}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Difficulty:</span>
                              <span className="font-medium">{selectedItem.difficulty}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Rating:</span>
                              <span className="font-medium">⭐ {selectedItem.rating} ({selectedItem.reviewCount} reviews)</span>
                            </div>
                          </div>
                        </div>

                        {/* Dietary Info */}
                        <div className="bg-muted/20 p-3 rounded-lg">
                          <h4 className="font-semibold mb-2 text-sm">Dietary Information</h4>
                          <div className="flex flex-wrap gap-1">
                            {selectedItem.isVegetarian && (
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">🌱 Vegetarian</span>
                            )}
                            {selectedItem.isVegan && (
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">🌿 Vegan</span>
                            )}
                            {selectedItem.isGlutenFree && (
                              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">🌾 Gluten-Free</span>
                            )}
                            {selectedItem.isSpicy && (
                              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">🌶️ Spicy</span>
                            )}
                          </div>
                        </div>

                        {/* Ingredients */}
                        {!!(selectedItem.ingredients.length > 0) && (
                          <div className="bg-muted/20 p-3 rounded-lg">
                            <h4 className="font-semibold mb-2 text-sm">Ingredients</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {selectedItem.ingredients.join(', ')}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Enhanced Action Bar */}
                      <div className="flex-shrink-0 bg-background border-t p-3">
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col">
                            <div className="text-lg font-bold text-primary">{selectedItem.price}</div>
                            {selectedItem.originalPrice && (
                              <div className="text-xs text-muted-foreground line-through">{selectedItem.originalPrice}</div>
                            )}
                          </div>
                          <Button 
                            className="flex-1 h-10 gap-2 font-medium text-sm" 
                            onClick={handleAddToCart}
                            disabled={isAdding}
                          >
                            {isAdding ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Adding...
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="w-4 h-4" />
                                Add to Cart
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
              
            </div>

            {/* Quantity Controls or Add Button */}
            {currentQuantity > 0 ? (
              <div className="flex items-center gap-1 bg-primary/10 rounded-lg p-1 relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDecrement}
                  className="h-7 w-7 p-0 hover:bg-primary/20 transition-none"
                  suppressHydrationWarning
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Minus className="w-3 h-3" />
                  )}
                </Button>
                <span className="min-w-[1.5rem] text-center font-medium text-primary text-sm">
                  {currentQuantity}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleIncrement}
                  className="h-7 w-7 p-0 hover:bg-primary/20 transition-none"
                  suppressHydrationWarning
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Plus className="w-3 h-3" />
                  )}
                </Button>
              </div>
            ) : (
              <Button 
                size="sm" 
                className="gap-2 font-medium" 
                onClick={handleAddToCart}
                disabled={isAdding}
              >
                {isAdding ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    Add
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default ProfessionalFoodCard