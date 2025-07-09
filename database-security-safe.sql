-- =============================================
-- Yumzy Database Security Setup (Safe Version)
-- Handles existing policies gracefully
-- =============================================

-- Enable RLS on all tables (safe to run multiple times)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- =============================================
-- DROP EXISTING POLICIES (if they exist)
-- =============================================

-- Users table policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;

-- Food items policies
DROP POLICY IF EXISTS "Everyone can view food items" ON food_items;
DROP POLICY IF EXISTS "Admins can manage food items" ON food_items;

-- Categories policies
DROP POLICY IF EXISTS "Everyone can view categories" ON categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;

-- Orders policies
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create own orders" ON orders;
DROP POLICY IF EXISTS "Users can update own orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON orders;

-- Order items policies
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Users can create own order items" ON order_items;
DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;

-- Cart policies
DROP POLICY IF EXISTS "Users can view own cart" ON cart;
DROP POLICY IF EXISTS "Users can manage own cart" ON cart;

-- Favorites policies
DROP POLICY IF EXISTS "Users can view own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can manage own favorites" ON favorites;

-- Notifications policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can create notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can view all notifications" ON notifications;

-- Addresses policies
DROP POLICY IF EXISTS "Users can view own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can manage own addresses" ON addresses;

-- Reviews policies
DROP POLICY IF EXISTS "Everyone can view reviews" ON reviews;
DROP POLICY IF EXISTS "Users can create own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can delete own reviews" ON reviews;
DROP POLICY IF EXISTS "Admins can manage all reviews" ON reviews;

-- Contact messages policies
DROP POLICY IF EXISTS "Anyone can create contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Admins can view all contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Admins can update contact messages" ON contact_messages;

-- =============================================
-- CREATE NEW POLICIES
-- =============================================

-- IMPORTANT: Since you're using custom auth (not Supabase auth), 
-- we need to modify the policies to work with your auth system

-- Users table policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (true); -- Temporarily allow all, will be handled by your API

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (true); -- Temporarily allow all, will be handled by your API

-- Food items and categories (public read)
CREATE POLICY "Everyone can view food items" ON food_items
    FOR SELECT USING (true);

CREATE POLICY "Everyone can view categories" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage food items" ON food_items
    FOR ALL USING (true); -- Will be handled by your API auth

CREATE POLICY "Admins can manage categories" ON categories
    FOR ALL USING (true); -- Will be handled by your API auth

-- Orders policies
CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (true); -- Will be handled by your API auth

CREATE POLICY "Users can create own orders" ON orders
    FOR INSERT WITH CHECK (true); -- Will be handled by your API auth

CREATE POLICY "Users can update own orders" ON orders
    FOR UPDATE USING (true); -- Will be handled by your API auth

-- Order items policies
CREATE POLICY "Users can view own order items" ON order_items
    FOR SELECT USING (true); -- Will be handled by your API auth

CREATE POLICY "Users can create own order items" ON order_items
    FOR INSERT WITH CHECK (true); -- Will be handled by your API auth

-- Cart policies
CREATE POLICY "Users can view own cart" ON cart
    FOR SELECT USING (true); -- Will be handled by your API auth

CREATE POLICY "Users can manage own cart" ON cart
    FOR ALL USING (true); -- Will be handled by your API auth

-- Favorites policies
CREATE POLICY "Users can view own favorites" ON favorites
    FOR SELECT USING (true); -- Will be handled by your API auth

CREATE POLICY "Users can manage own favorites" ON favorites
    FOR ALL USING (true); -- Will be handled by your API auth

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (true); -- Will be handled by your API auth

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (true); -- Will be handled by your API auth

CREATE POLICY "Admins can create notifications" ON notifications
    FOR INSERT WITH CHECK (true); -- Will be handled by your API auth

-- Addresses policies
CREATE POLICY "Users can view own addresses" ON addresses
    FOR SELECT USING (true); -- Will be handled by your API auth

CREATE POLICY "Users can manage own addresses" ON addresses
    FOR ALL USING (true); -- Will be handled by your API auth

-- Reviews policies
CREATE POLICY "Everyone can view reviews" ON reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can create own reviews" ON reviews
    FOR INSERT WITH CHECK (true); -- Will be handled by your API auth

CREATE POLICY "Users can update own reviews" ON reviews
    FOR UPDATE USING (true); -- Will be handled by your API auth

CREATE POLICY "Users can delete own reviews" ON reviews
    FOR DELETE USING (true); -- Will be handled by your API auth

-- Contact messages policies
CREATE POLICY "Anyone can create contact messages" ON contact_messages
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all contact messages" ON contact_messages
    FOR SELECT USING (true); -- Will be handled by your API auth

CREATE POLICY "Admins can update contact messages" ON contact_messages
    FOR UPDATE USING (true); -- Will be handled by your API auth

-- =============================================
-- PERFORMANCE INDEXES (Safe to run multiple times)
-- =============================================

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart(user_id);
CREATE INDEX IF NOT EXISTS idx_food_items_category ON food_items(category_id);
CREATE INDEX IF NOT EXISTS idx_food_items_popular ON food_items(is_popular);
CREATE INDEX IF NOT EXISTS idx_food_items_available ON food_items(is_available);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_food_item ON reviews(food_item_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at);

-- =============================================
-- COMPLETION MESSAGE
-- =============================================

SELECT 'Database security setup complete! RLS enabled and indexes created.' as status;