-- Fix remaining food items with unrealistic pricing in Supabase database
-- Update items that still have old pricing patterns like .99, .89, etc.

-- Vietnamese/Asian items
UPDATE food_items SET price = '280', original_price = '350', discount = 20 WHERE name = 'Beef Pho';
UPDATE food_items SET price = '290', original_price = '360', discount = 19 WHERE name = 'Pho Tai';
UPDATE food_items SET price = '320', original_price = '390', discount = 18 WHERE name = 'Thai Basil Beef';

-- French/European items
UPDATE food_items SET price = '450', original_price = '550', discount = 18 WHERE name = 'Beef Bourguignon';

-- Korean/Asian items
UPDATE food_items SET price = '380', original_price = '450', discount = 16 WHERE name = 'Marinated Beef Bulgogi';
UPDATE food_items SET price = '380', original_price = '450', discount = 16 WHERE name = 'Korean BBQ Beef';

-- Japanese items
UPDATE food_items SET price = '340', original_price = '420', discount = 19 WHERE name = 'Beef Ramen';

-- Indian beverages
UPDATE food_items SET price = '80', original_price = '100', discount = 20 WHERE name = 'Mango Lassi';

-- Vietnamese/Asian items
UPDATE food_items SET price = '310', original_price = '380', discount = 18 WHERE name = 'Lemongrass Chicken';

-- Other items that might need updates
UPDATE food_items SET price = '180', original_price = '220', discount = 18 WHERE name = 'Vegetarian Sticky Rice';
UPDATE food_items SET price = '360', original_price = '440', discount = 18 WHERE name = 'Grilled Brazilian Style Chicken';
UPDATE food_items SET price = '150', original_price = '180', discount = 17 WHERE name = 'Pao de Acucar';
UPDATE food_items SET price = '380', original_price = '460', discount = 17 WHERE name = 'Schnitzel';

-- Update any remaining items with decimal pricing patterns
UPDATE food_items SET 
    price = CASE 
        WHEN CAST(price AS DECIMAL) < 50 THEN CAST((CAST(price AS DECIMAL) * 15) AS VARCHAR)
        WHEN price LIKE '%.99' THEN CAST((CAST(REPLACE(price, '.99', '') AS DECIMAL) * 20) AS VARCHAR)
        WHEN price LIKE '%.89' THEN CAST((CAST(REPLACE(price, '.89', '') AS DECIMAL) * 20) AS VARCHAR)
        WHEN price LIKE '%.95' THEN CAST((CAST(REPLACE(price, '.95', '') AS DECIMAL) * 20) AS VARCHAR)
        ELSE price
    END,
    original_price = CASE 
        WHEN CAST(price AS DECIMAL) < 50 THEN CAST((CAST(price AS DECIMAL) * 18) AS VARCHAR)
        WHEN price LIKE '%.99' OR price LIKE '%.89' OR price LIKE '%.95' 
        THEN CAST((CAST(REGEXP_REPLACE(price, '\.[0-9]+', '') AS DECIMAL) * 25) AS VARCHAR)
        ELSE original_price
    END,
    discount = CASE 
        WHEN CAST(price AS DECIMAL) < 50 OR price LIKE '%.99' OR price LIKE '%.89' OR price LIKE '%.95' 
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

-- Set minimum price of 40 for any items that are still too low
UPDATE food_items SET 
    price = '40',
    original_price = '50',
    discount = 20
WHERE CAST(price AS DECIMAL) < 40;

-- Verify the updates
SELECT name, price, original_price, discount 
FROM food_items 
WHERE CAST(price AS DECIMAL) < 100 
ORDER BY CAST(price AS DECIMAL) ASC
LIMIT 20;