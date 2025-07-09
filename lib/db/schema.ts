import { pgTable, text, integer, decimal, timestamp, boolean, uuid, jsonb, varchar, uniqueIndex } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Categories table
export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  image: text('image'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Food items table
export const foodItems = pgTable('food_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  shortDescription: text('short_description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal('original_price', { precision: 10, scale: 2 }),
  discount: integer('discount').default(0),
  rating: decimal('rating', { precision: 3, scale: 2 }).default('4.5'),
  reviewCount: integer('review_count').default(0),
  cookTime: text('cook_time').notNull(),
  difficulty: text('difficulty').notNull(),
  spiceLevel: integer('spice_level').default(0),
  servingSize: text('serving_size'),
  calories: integer('calories'),
  image: text('image').notNull(),
  images: jsonb('images').$type<string[]>().default([]),
  ingredients: jsonb('ingredients').$type<string[]>().default([]),
  allergens: jsonb('allergens').$type<string[]>().default([]),
  nutritionInfo: jsonb('nutrition_info').$type<{
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber: number
    sugar: number
  }>(),
  tags: jsonb('tags').$type<string[]>().default([]),
  isVegetarian: boolean('is_vegetarian').default(false),
  isVegan: boolean('is_vegan').default(false),
  isGlutenFree: boolean('is_gluten_free').default(false),
  isSpicy: boolean('is_spicy').default(false),
  isPopular: boolean('is_popular').default(false),
  isAvailable: boolean('is_available').default(true),
  categoryId: uuid('category_id').references(() => categories.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Users table (extended)
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  phone: text('phone'),
  avatar: text('avatar'),
  role: text('role').default('user'),
  isVerified: boolean('is_verified').default(false),
  preferences: jsonb('preferences').$type<{
    notifications: boolean
    newsletter: boolean
    dietaryRestrictions: string[]
  }>().default({
    notifications: true,
    newsletter: false,
    dietaryRestrictions: []
  }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Orders table
export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  status: text('status').notNull().default('pending'),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  tax: decimal('tax', { precision: 10, scale: 2 }).notNull(),
  deliveryFee: decimal('delivery_fee', { precision: 10, scale: 2 }).notNull(),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  deliveryAddress: jsonb('delivery_address').$type<{
    street: string
    city: string
    state: string
    zipCode: string
    instructions?: string
  }>(),
  estimatedDeliveryTime: text('estimated_delivery_time'),
  actualDeliveryTime: timestamp('actual_delivery_time'),
  paymentMethod: text('payment_method'),
  paymentStatus: text('payment_status').default('pending'),
  notes: text('notes'),
  trackingInfo: jsonb('tracking_info').$type<{
    driverId?: string;
    currentLocation?: string; // JSON string for location
    status?: string;
    estimatedArrival?: Date;
    lastUpdate?: Date;
  }>(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Order items table
export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').references(() => orders.id).notNull(),
  foodItemId: uuid('food_item_id').references(() => foodItems.id).notNull(),
  quantity: integer('quantity').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  specialInstructions: text('special_instructions'),
  createdAt: timestamp('created_at').defaultNow(),
})

// Notifications table
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  type: text('type').notNull(), // 'order_update', 'promo', 'system', etc.
  title: text('title').notNull(),
  message: text('message').notNull(),
  data: jsonb('data').$type<Record<string, any>>(),
  isRead: boolean('is_read').default(false),
  isImportant: boolean('is_important').default(false),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
})

// Cart table
export const cart = pgTable('cart', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  foodItemId: uuid('food_item_id').references(() => foodItems.id).notNull(),
  quantity: integer('quantity').notNull(),
  specialInstructions: text('special_instructions'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Reviews table
export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  foodItemId: uuid('food_item_id').references(() => foodItems.id).notNull(),
  orderId: uuid('order_id').references(() => orders.id),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  images: jsonb('images').$type<string[]>().default([]),
  isVerified: boolean('is_verified').default(false),
  helpfulCount: integer('helpful_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Relations
export const categoriesRelations = relations(categories, ({ many }) => ({
  foodItems: many(foodItems),
}))

export const foodItemsRelations = relations(foodItems, ({ one, many }) => ({
  category: one(categories, {
    fields: [foodItems.categoryId],
    references: [categories.id],
  }),
  orderItems: many(orderItems),
  cartItems: many(cart),
  reviews: many(reviews),
}))

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  notifications: many(notifications),
  cartItems: many(cart),
  reviews: many(reviews),
  addresses: many(addresses),
}))

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}))

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  foodItem: one(foodItems, {
    fields: [orderItems.foodItemId],
    references: [foodItems.id],
  }),
}))

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}))

export const cartRelations = relations(cart, ({ one }) => ({
  user: one(users, {
    fields: [cart.userId],
    references: [users.id],
  }),
  foodItem: one(foodItems, {
    fields: [cart.foodItemId],
    references: [foodItems.id],
  }),
}))

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  foodItem: one(foodItems, {
    fields: [reviews.foodItemId],
    references: [foodItems.id],
  }),
  order: one(orders, {
    fields: [reviews.orderId],
    references: [orders.id],
  }),
}))

// Contact Messages Table
export const contactMessages = pgTable('contact_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  subject: varchar('subject', { length: 500 }).notNull(),
  message: text('message').notNull(),
  category: varchar('category', { length: 50 }).default('general'),
  orderNumber: varchar('order_number', { length: 50 }),
  ticketNumber: varchar('ticket_number', { length: 50 }),
  status: varchar('status', { length: 20 }).default('new'), // new, in_progress, resolved, closed
  priority: varchar('priority', { length: 20 }).default('normal'), // low, normal, high, urgent
  assignedTo: uuid('assigned_to').references(() => users.id),
  responseCount: integer('response_count').default(0),
  lastResponseAt: timestamp('last_response_at'),
  resolvedAt: timestamp('resolved_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Favorites Table
export const favorites = pgTable('favorites', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  foodItemId: uuid('food_item_id').notNull().references(() => foodItems.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  userFoodItemIdx: uniqueIndex('user_food_item_idx').on(table.userId, table.foodItemId),
}))

export const contactMessagesRelations = relations(contactMessages, ({ one }) => ({
  assignedUser: one(users, {
    fields: [contactMessages.assignedTo],
    references: [users.id],
  }),
}))

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  foodItem: one(foodItems, {
    fields: [favorites.foodItemId],
    references: [foodItems.id],
  }),
}))

// Addresses table
export const addresses = pgTable('addresses', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  type: text('type').default('home'), // e.g., 'home', 'work'
  street: text('street').notNull(),
  city: text('city').notNull(),
  state: text('state').notNull(),
  postalCode: text('postal_code').notNull(),
  country: text('country').default('United States'),
  landmark: text('landmark'),
  instructions: text('instructions'),
  isDefault: boolean('is_default').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, {
    fields: [addresses.userId],
    references: [users.id],
  }),
}));

// Types
export type Category = typeof categories.$inferSelect
export type FoodItem = typeof foodItems.$inferSelect
export type User = typeof users.$inferSelect
export type Order = typeof orders.$inferSelect
export type OrderItem = typeof orderItems.$inferSelect
export type Notification = typeof notifications.$inferSelect
export type CartItem = typeof cart.$inferSelect
export type Review = typeof reviews.$inferSelect

export type InsertCategory = typeof categories.$inferInsert
export type InsertFoodItem = typeof foodItems.$inferInsert
export type InsertUser = typeof users.$inferInsert
export type InsertOrder = typeof orders.$inferInsert
export type InsertOrderItem = typeof orderItems.$inferInsert
export type InsertNotification = typeof notifications.$inferInsert
export type InsertCartItem = typeof cart.$inferInsert
export type InsertReview = typeof reviews.$inferInsert
export type ContactMessage = typeof contactMessages.$inferSelect
export type InsertContactMessage = typeof contactMessages.$inferInsert
export type Favorite = typeof favorites.$inferSelect
export type InsertFavorite = typeof favorites.$inferInsert
export type Address = typeof addresses.$inferSelect;
export type InsertAddress = typeof addresses.$inferInsert;

// Export all tables for database operations
export const contactMessagesTable = contactMessages
export const favoritesTable = favorites
export const addressesTable = addresses
export const ordersTable = orders
export const orderItemsTable = orderItems
export const foodItemsTable = foodItems
export const usersTable = users
export const cartTable = cart
export const reviewsTable = reviews
export const categoriesTable = categories
export const notificationsTable = notifications;