// Production-ready validation schemas using Zod
import { z } from 'zod'

// User validation schemas
export const userValidation = {
  // Registration schema
  register: z.object({
    name: z.string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be less than 50 characters')
      .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
    
    email: z.string()
      .email('Invalid email address')
      .max(100, 'Email must be less than 100 characters')
      .toLowerCase(),
    
    password: z.string()
      .min(6, 'Password must be at least 6 characters')
      .max(128, 'Password must be less than 128 characters'),
    
    phone: z.union([
      z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format'),
      z.literal(''),
      z.undefined()
    ]).optional(),
    
    preferences: z.object({
      notifications: z.boolean().default(true),
      newsletter: z.boolean().default(false),
      dietaryRestrictions: z.array(z.string()).default([])
    }).optional()
  }),

  // Login schema
  login: z.object({
    email: z.string()
      .email('Invalid email address')
      .toLowerCase(),
    
    password: z.string()
      .min(1, 'Password is required')
      .max(128, 'Password must be less than 128 characters')
  }),

  // Profile update schema
  updateProfile: z.object({
    name: z.string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be less than 50 characters')
      .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
      .optional(),
    
    phone: z.string()
      .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format')
      .optional(),
    
    preferences: z.object({
      notifications: z.boolean(),
      newsletter: z.boolean(),
      dietaryRestrictions: z.array(z.string())
    }).optional()
  }),

  // Password change schema
  changePassword: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string()
      .min(8, 'New password must be at least 8 characters')
      .max(128, 'New password must be less than 128 characters')
      .regex(/[A-Z]/, 'New password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'New password must contain at least one lowercase letter')
      .regex(/\d/, 'New password must contain at least one number')
      .regex(/[!@#$%^&*(),.?":{}|<>]/, 'New password must contain at least one special character'),
    confirmPassword: z.string()
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
}

// Food item validation schemas
export const foodItemValidation = {
  // Create food item schema
  create: z.object({
    name: z.string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must be less than 100 characters'),
    
    description: z.string()
      .min(10, 'Description must be at least 10 characters')
      .max(500, 'Description must be less than 500 characters'),
    
    shortDescription: z.string()
      .max(150, 'Short description must be less than 150 characters')
      .optional(),
    
    price: z.string()
      .regex(/^\d+\.?\d{0,2}$/, 'Invalid price format')
      .refine((val) => parseFloat(val) > 0, 'Price must be greater than 0')
      .refine((val) => parseFloat(val) <= 10000, 'Price must be less than 10000'),
    
    originalPrice: z.string()
      .regex(/^\d+\.?\d{0,2}$/, 'Invalid original price format')
      .optional(),
    
    discount: z.number()
      .min(0, 'Discount cannot be negative')
      .max(90, 'Discount cannot exceed 90%')
      .optional(),
    
    cookTime: z.string()
      .regex(/^\d+(-\d+)?\s*(min|mins|minutes?|hr|hrs|hours?)$/i, 'Invalid cook time format'),
    
    servingSize: z.string()
      .min(1, 'Serving size is required')
      .max(50, 'Serving size must be less than 50 characters'),
    
    calories: z.number()
      .min(0, 'Calories cannot be negative')
      .max(5000, 'Calories seem too high'),
    
    isVegetarian: z.boolean().default(false),
    isVegan: z.boolean().default(false),
    isGlutenFree: z.boolean().default(false),
    isSpicy: z.boolean().default(false),
    isPopular: z.boolean().default(false),
    isAvailable: z.boolean().default(true),
    
    ingredients: z.array(z.string().min(1)).default([]),
    allergens: z.array(z.string().min(1)).default([]),
    
    nutritionInfo: z.object({
      calories: z.number().min(0),
      protein: z.number().min(0),
      carbs: z.number().min(0),
      fat: z.number().min(0),
      fiber: z.number().min(0),
      sugar: z.number().min(0)
    }),
    
    categoryId: z.string().uuid('Invalid category ID')
  }),

  // Update food item schema
  update: z.object({
    name: z.string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must be less than 100 characters')
      .optional(),
    
    description: z.string()
      .min(10, 'Description must be at least 10 characters')
      .max(500, 'Description must be less than 500 characters')
      .optional(),
    
    shortDescription: z.string()
      .max(150, 'Short description must be less than 150 characters')
      .optional(),
    
    price: z.string()
      .regex(/^\d+\.?\d{0,2}$/, 'Invalid price format')
      .refine((val) => parseFloat(val) > 0, 'Price must be greater than 0')
      .refine((val) => parseFloat(val) <= 10000, 'Price must be less than 10000')
      .optional(),
    
    isAvailable: z.boolean().optional(),
    
    nutritionInfo: z.object({
      calories: z.number().min(0),
      protein: z.number().min(0),
      carbs: z.number().min(0),
      fat: z.number().min(0),
      fiber: z.number().min(0),
      sugar: z.number().min(0)
    }).optional()
  })
}

// Cart validation schemas
export const cartValidation = {
  // Add to cart schema
  addItem: z.object({
    userId: z.string().uuid('Invalid user ID'),
    foodItemId: z.string().uuid('Invalid food item ID'),
    quantity: z.number()
      .int('Quantity must be a whole number')
      .min(1, 'Quantity must be at least 1')
      .max(50, 'Quantity cannot exceed 50'),
    specialInstructions: z.string()
      .max(200, 'Special instructions must be less than 200 characters')
      .optional()
  }),

  // Update cart item schema
  updateItem: z.object({
    userId: z.string().uuid('Invalid user ID'),
    quantity: z.number()
      .int('Quantity must be a whole number')
      .min(0, 'Quantity cannot be negative')
      .max(50, 'Quantity cannot exceed 50'),
    specialInstructions: z.string()
      .max(200, 'Special instructions must be less than 200 characters')
      .optional()
  })
}

// Order validation schemas
export const orderValidation = {
  // Create order schema
  create: z.object({
    userId: z.string().uuid('Invalid user ID'),
    items: z.array(z.object({
      foodItemId: z.string().uuid('Invalid food item ID'),
      quantity: z.number().int().min(1).max(50),
      price: z.string().regex(/^\d+\.?\d{0,2}$/),
      specialInstructions: z.string().max(200).optional()
    })).min(1, 'Order must contain at least one item'),
    
    deliveryAddress: z.object({
      street: z.string().min(5, 'Street address must be at least 5 characters'),
      city: z.string().min(2, 'City must be at least 2 characters'),
      state: z.string().min(2, 'State must be at least 2 characters'),
      zipCode: z.string().regex(/^\d{5,6}$/, 'Invalid zip code'),
      country: z.string().min(2, 'Country must be at least 2 characters')
    }),
    
    paymentMethod: z.enum(['card', 'cash', 'upi'], {
      errorMap: () => ({ message: 'Invalid payment method' })
    }),
    
    specialInstructions: z.string()
      .max(500, 'Special instructions must be less than 500 characters')
      .optional()
  })
}

// Query parameter validation
export const queryValidation = {
  // Pagination schema
  pagination: z.object({
    page: z.string()
      .regex(/^\d+$/, 'Page must be a number')
      .transform((val) => Math.max(1, parseInt(val)))
      .default('1'),
    
    limit: z.string()
      .regex(/^\d+$/, 'Limit must be a number')
      .transform((val) => Math.min(100, Math.max(1, parseInt(val))))
      .default('10')
  }),

  // Search schema
  search: z.object({
    query: z.string()
      .min(1, 'Search query cannot be empty')
      .max(100, 'Search query must be less than 100 characters')
      .optional(),
    
    category: z.string()
      .max(50, 'Category must be less than 50 characters')
      .optional(),
    
    sortBy: z.enum(['name', 'price', 'rating', 'popularity', 'created'])
      .default('name'),
    
    sortOrder: z.enum(['asc', 'desc'])
      .default('asc'),
    
    minPrice: z.string()
      .regex(/^\d+\.?\d{0,2}$/, 'Invalid minimum price format')
      .optional(),
    
    maxPrice: z.string()
      .regex(/^\d+\.?\d{0,2}$/, 'Invalid maximum price format')
      .optional()
  })
}

// Contact form validation
export const contactValidation = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  
  email: z.string()
    .email('Invalid email address')
    .max(100, 'Email must be less than 100 characters'),
  
  subject: z.string()
    .min(5, 'Subject must be at least 5 characters')
    .max(100, 'Subject must be less than 100 characters'),
  
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be less than 1000 characters')
})

// Utility function for validation
export function validateWithSchema<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: T
  errors?: Record<string, string[]>
} {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {}
      error.errors.forEach((err) => {
        const path = err.path.join('.')
        if (!errors[path]) {
          errors[path] = []
        }
        errors[path].push(err.message)
      })
      return { success: false, errors }
    }
    return { success: false, errors: { general: ['Validation failed'] } }
  }
}

// Sanitization utilities
export class DataSanitizer {
  static sanitizeString(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/['"]/g, '') // Remove quotes to prevent injection
  }

  static sanitizeEmail(email: string): string {
    return email.toLowerCase().trim()
  }

  static sanitizeSearchQuery(query: string): string {
    return query
      .trim()
      .replace(/[<>'"]/g, '') // Remove HTML and quotes
      .replace(/[%_]/g, '') // Remove SQL wildcard characters
      .substring(0, 100) // Limit length
  }

  static sanitizeNumericString(input: string): string {
    return input.replace(/[^\d.]/g, '')
  }
}