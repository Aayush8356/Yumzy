# Fix Remaining Price Issues

## Issue Summary
Some food items in the database still have unrealistic pricing (like 8.99, 14.99, 17.99, etc.) and are missing rupee symbols.

## ✅ What I've Fixed:
1. **Menu API**: Added rupee symbol (₹) to all prices returned by `/api/menu/route.ts`
2. **TodaysSpecialSection**: Updated hardcoded prices to realistic Indian values
3. **Created admin tools**: `/admin/fix-pricing` page for manual updates

## 🔧 What Still Needs to be Done:

### Option 1: Manual Database Update (Recommended)
Login to your Supabase dashboard and run these SQL queries:

```sql
-- Update specific items with unrealistic pricing
UPDATE food_items SET price = '280', original_price = '350', discount = 20 WHERE name = 'Beef Pho';
UPDATE food_items SET price = '450', original_price = '550', discount = 18 WHERE name = 'Beef Bourguignon';
UPDATE food_items SET price = '380', original_price = '450', discount = 16 WHERE name = 'Marinated Beef Bulgogi';
UPDATE food_items SET price = '340', original_price = '420', discount = 19 WHERE name = 'Beef Ramen';
UPDATE food_items SET price = '290', original_price = '360', discount = 19 WHERE name = 'Pho Tai';
UPDATE food_items SET price = '320', original_price = '390', discount = 18 WHERE name = 'Thai Basil Beef';
UPDATE food_items SET price = '80', original_price = '100', discount = 20 WHERE name = 'Mango Lassi';
UPDATE food_items SET price = '310', original_price = '380', discount = 18 WHERE name = 'Lemongrass Chicken';
UPDATE food_items SET price = '380', original_price = '460', discount = 17 WHERE name = 'Schnitzel';
UPDATE food_items SET price = '150', original_price = '180', discount = 17 WHERE name = 'Pao de Acucar';

-- Update all items that still have decimal pricing patterns
UPDATE food_items SET 
    price = CASE 
        WHEN CAST(price AS DECIMAL) < 50 THEN '150'
        WHEN price LIKE '%.99' THEN CAST((CAST(REPLACE(price, '.99', '') AS DECIMAL) * 20) AS VARCHAR)
        WHEN price LIKE '%.89' THEN CAST((CAST(REPLACE(price, '.89', '') AS DECIMAL) * 20) AS VARCHAR)
        ELSE price
    END,
    original_price = CASE 
        WHEN CAST(price AS DECIMAL) < 50 THEN '180'
        WHEN price LIKE '%.99' OR price LIKE '%.89' 
        THEN CAST((CAST(REGEXP_REPLACE(price, '\.[0-9]+', '') AS DECIMAL) * 25) AS VARCHAR)
        ELSE original_price
    END,
    discount = CASE 
        WHEN CAST(price AS DECIMAL) < 50 OR price LIKE '%.99' OR price LIKE '%.89' 
        THEN 20
        ELSE COALESCE(discount, 0)
    END,
    updated_at = NOW()
WHERE 
    CAST(price AS DECIMAL) < 50 
    OR price LIKE '%.99' 
    OR price LIKE '%.89' 
    OR price LIKE '%.95'
    OR price LIKE '%.79'
    OR price LIKE '%.69';
```

### Option 2: Use the Admin Interface
1. Navigate to `http://localhost:3002/admin/fix-pricing`
2. Click "Fix All Pricing Issues" button
3. Or manually add specific items that need updates

### Option 3: API Call
If you have curl, run:
```bash
curl -X POST http://localhost:3002/api/admin/fix-remaining-prices \
  -H "Authorization: Bearer admin-test" \
  -H "Content-Type: application/json"
```

## 🔍 How to Verify the Fix:
1. Check the menu page - all prices should show ₹ symbol
2. Check the dashboard recommendations - should show realistic prices
3. Verify in Supabase database - all prices should be > 40 and realistic

## 📊 Expected Results:
- **Before**: Beef Pho 17.99, Mango Lassi 10.99, etc.
- **After**: Beef Pho ₹280, Mango Lassi ₹80, etc.

## 🎯 Items That Should Be Updated:
Based on the database screenshot, these items need updates:
- Beef Pho: 17.99 → ₹280
- Beef Bourguignon: 28.99 → ₹450
- Marinated Beef Bulgogi: 18.99 → ₹380
- Beef Ramen: 15.99 → ₹340
- Pho Tai: 15.99 → ₹290
- Thai Basil Beef: 18.99 → ₹320
- Mango Lassi: 10.99 → ₹80
- Lemongrass Chicken: 19.99 → ₹310
- Schnitzel: 22.99 → ₹380
- Pao de Acucar: 8.99 → ₹150

Once you run the SQL queries, all pricing should be consistent throughout the application!