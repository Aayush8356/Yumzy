export const categoriesData = [
  {
    id: 'burgers',
    name: 'Burgers',
    description: 'Juicy beef patties with fresh ingredients',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&h=600&q=80',
    itemCount: 3
  },
  {
    id: 'pizza',
    name: 'Pizza',
    description: 'Authentic Italian-style pizzas',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&h=600&q=80',
    itemCount: 3
  },
  {
    id: 'sushi',
    name: 'Sushi',
    description: 'Fresh Japanese sushi & sashimi',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&h=600&q=80',
    itemCount: 3
  },
  {
    id: 'salads',
    name: 'Salads',
    description: 'Healthy & nutritious green bowls',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&h=600&q=80',
    itemCount: 3
  },
  {
    id: 'desserts',
    name: 'Desserts',
    description: 'Sweet treats & delightful cakes',
    image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=800&h=600&q=80',
    itemCount: 3
  },
  {
    id: 'beverages',
    name: 'Beverages',
    description: 'Refreshing drinks & smoothies',
    image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=800&h=600&q=80',
    itemCount: 3
  }
];

export const foodItemsData = [
  // BURGERS
  {
    id: 'classic-cheeseburger',
    name: 'Classic Cheeseburger',
    description: 'A timeless classic featuring a juicy beef patty topped with melted American cheese, fresh lettuce, ripe tomatoes, pickles, and our signature sauce on a toasted sesame seed bun.',
    shortDescription: 'Juicy beef patty with melted cheese and fresh toppings',
    price: '299',
    originalPrice: '349',
    discount: 19,
    rating: '4.8',
    reviewCount: 324,
    cookTime: '12 min',
    difficulty: 'Easy',
    spiceLevel: 1,
    servingSize: '1 burger',
    calories: 650,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&h=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&h=600&q=80',
      'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=800&h=600&q=80'
    ],
    ingredients: ['Beef Patty', 'American Cheese', 'Lettuce', 'Tomato', 'Pickles', 'Sesame Bun', 'Special Sauce'],
    allergens: ['Gluten', 'Dairy', 'Soy'],
    nutritionInfo: {
      calories: 650,
      protein: 35,
      carbs: 42,
      fat: 38,
      fiber: 3,
      sugar: 8
    },
    tags: ['Classic', 'Comfort Food', 'American'],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isSpicy: false,
    isPopular: true,
    category: {
      id: 'burgers',
      name: 'Burgers',
      description: 'Juicy beef patties with fresh ingredients',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&h=600&q=80'
    }
  },
  {
    id: 'spicy-chicken-burger',
    name: 'Spicy Chicken Deluxe',
    description: 'Crispy fried chicken breast marinated in our signature spicy blend, topped with pepper jack cheese, jalapeños, crispy bacon, and chipotle mayo on a brioche bun.',
    shortDescription: 'Crispy spicy chicken with pepper jack and jalapeños',
    price: '349',
    originalPrice: '399',
    discount: 17,
    rating: '4.7',
    reviewCount: 256,
    cookTime: '15 min',
    difficulty: 'Medium',
    spiceLevel: 4,
    servingSize: '1 burger',
    calories: 720,
    image: 'https://images.unsplash.com/photo-1606755962773-d324e9a13086?auto=format&fit=crop&w=800&h=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1606755962773-d324e9a13086?auto=format&fit=crop&w=800&h=600&q=80',
      'https://images.unsplash.com/photo-1623653387945-2fd25214f8fc?auto=format&fit=crop&w=800&h=600&q=80'
    ],
    ingredients: ['Chicken Breast', 'Pepper Jack Cheese', 'Jalapeños', 'Bacon', 'Chipotle Mayo', 'Brioche Bun', 'Spicy Seasoning'],
    allergens: ['Gluten', 'Dairy', 'Eggs'],
    nutritionInfo: {
      calories: 720,
      protein: 42,
      carbs: 45,
      fat: 42,
      fiber: 2,
      sugar: 6
    },
    tags: ['Spicy', 'Chicken', 'Premium'],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isSpicy: true,
    isPopular: true,
    category: {
      id: 'burgers',
      name: 'Burgers',
      description: 'Juicy beef patties with fresh ingredients',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&h=600&q=80'
    }
  },
  {
    id: 'veggie-supreme',
    name: 'Veggie Supreme',
    description: 'House-made plant-based patty with roasted vegetables, avocado, sprouts, and herbed mayo on a whole grain bun. A nutritious and flavorful choice.',
    shortDescription: 'Plant-based patty with roasted vegetables and avocado',
    price: '279',
    rating: '4.6',
    reviewCount: 189,
    cookTime: '10 min',
    difficulty: 'Easy',
    spiceLevel: 1,
    servingSize: '1 burger',
    calories: 520,
    image: 'https://images.unsplash.com/photo-1525059696034-4967a729002e?auto=format&fit=crop&w=800&h=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1525059696034-4967a729002e?auto=format&fit=crop&w=800&h=600&q=80',
      'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=800&h=600&q=80'
    ],
    ingredients: ['Plant-Based Patty', 'Roasted Vegetables', 'Avocado', 'Sprouts', 'Herbed Mayo', 'Whole Grain Bun'],
    allergens: ['Gluten', 'Soy'],
    nutritionInfo: {
      calories: 520,
      protein: 22,
      carbs: 48,
      fat: 28,
      fiber: 8,
      sugar: 12
    },
    tags: ['Vegetarian', 'Healthy', 'Plant-Based'],
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: false,
    isSpicy: false,
    isPopular: false,
    category: {
      id: 'burgers',
      name: 'Burgers',
      description: 'Juicy beef patties with fresh ingredients',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&h=600&q=80'
    }
  },

  // PIZZA
  {
    id: 'margherita-pizza',
    name: 'Margherita Classica',
    description: 'Traditional Italian pizza with San Marzano tomatoes, fresh mozzarella di bufala, basil leaves, and extra virgin olive oil on our wood-fired thin crust.',
    shortDescription: 'Classic Italian pizza with fresh mozzarella and basil',
    price: '389',
    rating: '4.9',
    reviewCount: 412,
    cookTime: '18 min',
    difficulty: 'Medium',
    spiceLevel: 0,
    servingSize: '12 inch pizza',
    calories: 580,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&h=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&h=600&q=80',
      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&h=600&q=80'
    ],
    ingredients: ['San Marzano Tomatoes', 'Mozzarella di Bufala', 'Fresh Basil', 'Extra Virgin Olive Oil', 'Wood-Fired Crust'],
    allergens: ['Gluten', 'Dairy'],
    nutritionInfo: {
      calories: 580,
      protein: 28,
      carbs: 65,
      fat: 22,
      fiber: 4,
      sugar: 8
    },
    tags: ['Traditional', 'Italian', 'Vegetarian'],
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: false,
    isSpicy: false,
    isPopular: true,
    category: {
      id: 'pizza',
      name: 'Pizza',
      description: 'Authentic Italian-style pizzas',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&h=600&q=80'
    }
  },
  {
    id: 'meat-lovers-pizza',
    name: 'Meat Lovers Supreme',
    description: 'Ultimate carnivore pizza loaded with pepperoni, Italian sausage, bacon, ham, and ground beef on our signature tomato sauce and mozzarella cheese.',
    shortDescription: 'Loaded with five types of premium meats',
    price: '549',
    originalPrice: '649',
    discount: 15,
    rating: '4.8',
    reviewCount: 298,
    cookTime: '20 min',
    difficulty: 'Hard',
    spiceLevel: 2,
    servingSize: '14 inch pizza',
    calories: 820,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=800&h=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=800&h=600&q=80',
      'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&h=600&q=80'
    ],
    ingredients: ['Pepperoni', 'Italian Sausage', 'Bacon', 'Ham', 'Ground Beef', 'Mozzarella', 'Tomato Sauce'],
    allergens: ['Gluten', 'Dairy'],
    nutritionInfo: {
      calories: 820,
      protein: 45,
      carbs: 58,
      fat: 48,
      fiber: 3,
      sugar: 6
    },
    tags: ['Meat Lovers', 'Hearty', 'Premium'],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isSpicy: false,
    isPopular: true,
    category: {
      id: 'pizza',
      name: 'Pizza',
      description: 'Authentic Italian-style pizzas',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&h=600&q=80'
    }
  },
  {
    id: 'mediterranean-pizza',
    name: 'Mediterranean Delight',
    description: 'Mediterranean-inspired pizza with roasted vegetables, feta cheese, Kalamata olives, sun-dried tomatoes, and fresh herbs on olive oil base.',
    shortDescription: 'Mediterranean vegetables with feta and olives',
    price: '469',
    rating: '4.7',
    reviewCount: 167,
    cookTime: '16 min',
    difficulty: 'Medium',
    spiceLevel: 1,
    servingSize: '12 inch pizza',
    calories: 640,
    image: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=800&h=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=800&h=600&q=80',
      'https://images.unsplash.com/photo-1593504049359-74330189a345?auto=format&fit=crop&w=800&h=600&q=80'
    ],
    ingredients: ['Roasted Vegetables', 'Feta Cheese', 'Kalamata Olives', 'Sun-Dried Tomatoes', 'Fresh Herbs', 'Olive Oil'],
    allergens: ['Gluten', 'Dairy'],
    nutritionInfo: {
      calories: 640,
      protein: 24,
      carbs: 62,
      fat: 32,
      fiber: 6,
      sugar: 12
    },
    tags: ['Mediterranean', 'Vegetarian', 'Healthy'],
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: false,
    isSpicy: false,
    isPopular: false,
    category: {
      id: 'pizza',
      name: 'Pizza',
      description: 'Authentic Italian-style pizzas',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&h=600&q=80'
    }
  },

  // SUSHI
  {
    id: 'salmon-sashimi',
    name: 'Premium Salmon Sashimi',
    description: 'Fresh Atlantic salmon, expertly cut and served with wasabi, pickled ginger, and soy sauce. Our salmon is sustainably sourced and sushi-grade.',
    shortDescription: 'Fresh Atlantic salmon sashimi with traditional accompaniments',
    price: '439',
    rating: '4.9',
    reviewCount: 203,
    cookTime: '5 min',
    difficulty: 'Easy',
    spiceLevel: 2,
    servingSize: '8 pieces',
    calories: 240,
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&h=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&h=600&q=80',
      'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=800&h=600&q=80'
    ],
    ingredients: ['Fresh Atlantic Salmon', 'Wasabi', 'Pickled Ginger', 'Soy Sauce'],
    allergens: ['Fish', 'Soy'],
    nutritionInfo: {
      calories: 240,
      protein: 32,
      carbs: 2,
      fat: 12,
      fiber: 0,
      sugar: 1
    },
    tags: ['Fresh', 'Premium', 'Healthy'],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: true,
    isSpicy: true,
    isPopular: true,
    category: {
      id: 'sushi',
      name: 'Sushi',
      description: 'Fresh Japanese sushi & sashimi',
      image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&h=600&q=80'
    }
  },
  {
    id: 'california-roll',
    name: 'California Roll',
    description: 'Classic sushi roll with imitation crab, avocado, and cucumber, rolled in seasoned sushi rice and nori, topped with sesame seeds.',
    shortDescription: 'Classic roll with crab, avocado, and cucumber',
    price: '299',
    rating: '4.6',
    reviewCount: 345,
    cookTime: '8 min',
    difficulty: 'Medium',
    spiceLevel: 0,
    servingSize: '8 pieces',
    calories: 320,
    image: 'https://images.unsplash.com/photo-1617196034183-421b4917abd8?auto=format&fit=crop&w=800&h=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1617196034183-421b4917abd8?auto=format&fit=crop&w=800&h=600&q=80',
      'https://images.unsplash.com/photo-1582450871972-ab5ca641643d?auto=format&fit=crop&w=800&h=600&q=80'
    ],
    ingredients: ['Imitation Crab', 'Avocado', 'Cucumber', 'Sushi Rice', 'Nori', 'Sesame Seeds'],
    allergens: ['Shellfish', 'Soy', 'Sesame'],
    nutritionInfo: {
      calories: 320,
      protein: 16,
      carbs: 42,
      fat: 8,
      fiber: 3,
      sugar: 6
    },
    tags: ['Classic', 'Beginner-Friendly', 'Popular'],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isSpicy: false,
    isPopular: true,
    category: {
      id: 'sushi',
      name: 'Sushi',
      description: 'Fresh Japanese sushi & sashimi',
      image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&h=600&q=80'
    }
  },
  {
    id: 'vegetarian-sushi',
    name: 'Vegetarian Delight Roll',
    description: 'Fresh vegetarian roll with avocado, cucumber, carrot, and asparagus, topped with sesame seeds and served with ginger and wasabi.',
    shortDescription: 'Fresh vegetables rolled in seasoned sushi rice',
    price: '259',
    rating: '4.5',
    reviewCount: 128,
    cookTime: '6 min',
    difficulty: 'Easy',
    spiceLevel: 1,
    servingSize: '8 pieces',
    calories: 280,
    image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&h=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&h=600&q=80',
      'https://images.unsplash.com/photo-1580867924921-79b8343c2dd8?auto=format&fit=crop&w=800&h=600&q=80'
    ],
    ingredients: ['Avocado', 'Cucumber', 'Carrot', 'Asparagus', 'Sushi Rice', 'Nori', 'Sesame Seeds'],
    allergens: ['Soy', 'Sesame'],
    nutritionInfo: {
      calories: 280,
      protein: 8,
      carbs: 52,
      fat: 6,
      fiber: 5,
      sugar: 8
    },
    tags: ['Vegetarian', 'Healthy', 'Light'],
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: false,
    isSpicy: false,
    isPopular: false,
    category: {
      id: 'sushi',
      name: 'Sushi',
      description: 'Fresh Japanese sushi & sashimi',
      image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&h=600&q=80'
    }
  },

  // SALADS
  {
    id: 'caesar-salad',
    name: 'Classic Caesar Salad',
    description: 'Crisp romaine lettuce tossed with our house-made Caesar dressing, topped with parmesan cheese, croutons, and grilled chicken breast.',
    shortDescription: 'Traditional Caesar with grilled chicken and parmesan',
    price: '349',
    rating: '4.7',
    reviewCount: 289,
    cookTime: '8 min',
    difficulty: 'Easy',
    spiceLevel: 0,
    servingSize: '1 large bowl',
    calories: 420,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&h=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&h=600&q=80',
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&h=600&q=80'
    ],
    ingredients: ['Romaine Lettuce', 'Caesar Dressing', 'Parmesan Cheese', 'Croutons', 'Grilled Chicken'],
    allergens: ['Dairy', 'Gluten', 'Eggs'],
    nutritionInfo: {
      calories: 420,
      protein: 32,
      carbs: 18,
      fat: 26,
      fiber: 4,
      sugar: 4
    },
    tags: ['Classic', 'Protein-Rich', 'Satisfying'],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isSpicy: false,
    isPopular: true,
    category: {
      id: 'salads',
      name: 'Salads',
      description: 'Healthy & nutritious green bowls',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&h=600&q=80'
    }
  },
  {
    id: 'quinoa-power-bowl',
    name: 'Quinoa Power Bowl',
    description: 'Nutrient-packed bowl with quinoa, roasted vegetables, chickpeas, avocado, and tahini dressing. A complete protein powerhouse.',
    shortDescription: 'Quinoa bowl with roasted vegetables and tahini dressing',
    price: '389',
    rating: '4.8',
    reviewCount: 156,
    cookTime: '10 min',
    difficulty: 'Medium',
    spiceLevel: 1,
    servingSize: '1 large bowl',
    calories: 480,
    image: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?auto=format&fit=crop&w=800&h=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?auto=format&fit=crop&w=800&h=600&q=80',
      'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&h=600&q=80'
    ],
    ingredients: ['Quinoa', 'Roasted Vegetables', 'Chickpeas', 'Avocado', 'Tahini Dressing', 'Mixed Greens'],
    allergens: ['Sesame', 'Nuts'],
    nutritionInfo: {
      calories: 480,
      protein: 18,
      carbs: 58,
      fat: 22,
      fiber: 12,
      sugar: 14
    },
    tags: ['Superfood', 'Vegan', 'Protein-Rich'],
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    isSpicy: false,
    isPopular: true,
    category: {
      id: 'salads',
      name: 'Salads',
      description: 'Healthy & nutritious green bowls',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&h=600&q=80'
    }
  },
  {
    id: 'mediterranean-salad',
    name: 'Mediterranean Garden',
    description: 'Fresh Mediterranean salad with mixed greens, cherry tomatoes, cucumbers, olives, feta cheese, and olive oil vinaigrette.',
    shortDescription: 'Fresh Mediterranean vegetables with feta and olives',
    price: '319',
    rating: '4.6',
    reviewCount: 198,
    cookTime: '5 min',
    difficulty: 'Easy',
    spiceLevel: 0,
    servingSize: '1 large bowl',
    calories: 350,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&h=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&h=600&q=80',
      'https://images.unsplash.com/photo-1505576633371-6aae2d583b9a?auto=format&fit=crop&w=800&h=600&q=80'
    ],
    ingredients: ['Mixed Greens', 'Cherry Tomatoes', 'Cucumbers', 'Olives', 'Feta Cheese', 'Olive Oil Vinaigrette'],
    allergens: ['Dairy'],
    nutritionInfo: {
      calories: 350,
      protein: 12,
      carbs: 24,
      fat: 26,
      fiber: 8,
      sugar: 16
    },
    tags: ['Mediterranean', 'Light', 'Vegetarian'],
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: true,
    isSpicy: false,
    isPopular: false,
    category: {
      id: 'salads',
      name: 'Salads',
      description: 'Healthy & nutritious green bowls',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&h=600&q=80'
    }
  },

  // DESSERTS
  {
    id: 'chocolate-lava-cake',
    name: 'Chocolate Lava Cake',
    description: 'Decadent chocolate cake with a molten chocolate center, served warm with vanilla ice cream and fresh berries.',
    shortDescription: 'Warm chocolate cake with molten center and vanilla ice cream',
    price: '229',
    rating: '4.9',
    reviewCount: 412,
    cookTime: '15 min',
    difficulty: 'Hard',
    spiceLevel: 0,
    servingSize: '1 cake',
    calories: 520,
    image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=800&h=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=800&h=600&q=80',
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&h=600&q=80'
    ],
    ingredients: ['Dark Chocolate', 'Butter', 'Eggs', 'Sugar', 'Flour', 'Vanilla Ice Cream', 'Fresh Berries'],
    allergens: ['Dairy', 'Eggs', 'Gluten'],
    nutritionInfo: {
      calories: 520,
      protein: 8,
      carbs: 58,
      fat: 28,
      fiber: 3,
      sugar: 48
    },
    tags: ['Indulgent', 'Chocolate', 'Warm'],
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: false,
    isSpicy: false,
    isPopular: true,
    category: {
      id: 'desserts',
      name: 'Desserts',
      description: 'Sweet treats & delightful cakes',
      image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=800&h=600&q=80'
    }
  },
  {
    id: 'tiramisu',
    name: 'Classic Tiramisu',
    description: 'Traditional Italian dessert with coffee-soaked ladyfingers layered with mascarpone cream and dusted with cocoa powder.',
    shortDescription: 'Traditional Italian coffee-flavored dessert',
    price: '199',
    rating: '4.8',
    reviewCount: 234,
    cookTime: '20 min',
    difficulty: 'Medium',
    spiceLevel: 0,
    servingSize: '1 slice',
    calories: 380,
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&h=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&h=600&q=80',
      'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&h=600&q=80'
    ],
    ingredients: ['Ladyfingers', 'Espresso', 'Mascarpone', 'Eggs', 'Sugar', 'Cocoa Powder', 'Coffee Liqueur'],
    allergens: ['Dairy', 'Eggs', 'Gluten'],
    nutritionInfo: {
      calories: 380,
      protein: 6,
      carbs: 32,
      fat: 24,
      fiber: 1,
      sugar: 28
    },
    tags: ['Italian', 'Coffee', 'Classic'],
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: false,
    isSpicy: false,
    isPopular: true,
    category: {
      id: 'desserts',
      name: 'Desserts',
      description: 'Sweet treats & delightful cakes',
      image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=800&h=600&q=80'
    }
  },
  {
    id: 'vegan-cheesecake',
    name: 'Vegan Berry Cheesecake',
    description: 'Creamy vegan cheesecake made with cashews and coconut cream, topped with fresh mixed berries and berry compote.',
    shortDescription: 'Creamy vegan cheesecake with mixed berries',
    price: '249',
    rating: '4.5',
    reviewCount: 89,
    cookTime: '25 min',
    difficulty: 'Medium',
    spiceLevel: 0,
    servingSize: '1 slice',
    calories: 420,
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&h=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&h=600&q=80',
      'https://images.unsplash.com/photo-1524351199678-941a58a3df50?auto=format&fit=crop&w=800&h=600&q=80'
    ],
    ingredients: ['Cashews', 'Coconut Cream', 'Mixed Berries', 'Berry Compote', 'Almond Flour', 'Maple Syrup'],
    allergens: ['Nuts'],
    nutritionInfo: {
      calories: 420,
      protein: 8,
      carbs: 38,
      fat: 28,
      fiber: 5,
      sugar: 30
    },
    tags: ['Vegan', 'Healthy', 'Berries'],
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    isSpicy: false,
    isPopular: false,
    category: {
      id: 'desserts',
      name: 'Desserts',
      description: 'Sweet treats & delightful cakes',
      image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=800&h=600&q=80'
    }
  },

  // BEVERAGES
  {
    id: 'tropical-smoothie',
    name: 'Tropical Paradise Smoothie',
    description: 'Refreshing blend of mango, pineapple, coconut milk, and banana, topped with toasted coconut flakes and chia seeds.',
    shortDescription: 'Mango, pineapple, and coconut milk smoothie',
    price: '179',
    rating: '4.7',
    reviewCount: 156,
    cookTime: '3 min',
    difficulty: 'Easy',
    spiceLevel: 0,
    servingSize: '16 oz',
    calories: 240,
    image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=800&h=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=800&h=600&q=80',
      'https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=800&h=600&q=80'
    ],
    ingredients: ['Mango', 'Pineapple', 'Coconut Milk', 'Banana', 'Toasted Coconut', 'Chia Seeds'],
    allergens: ['Coconut'],
    nutritionInfo: {
      calories: 240,
      protein: 4,
      carbs: 52,
      fat: 8,
      fiber: 6,
      sugar: 42
    },
    tags: ['Tropical', 'Refreshing', 'Vegan'],
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    isSpicy: false,
    isPopular: true,
    category: {
      id: 'beverages',
      name: 'Beverages',
      description: 'Refreshing drinks & smoothies',
      image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=800&h=600&q=80'
    }
  },
  {
    id: 'cold-brew-coffee',
    name: 'Premium Cold Brew',
    description: 'Slow-steeped cold brew coffee made from single-origin beans, served over ice with a choice of milk or cream.',
    shortDescription: 'Smooth cold brew from single-origin beans',
    price: '129',
    rating: '4.6',
    reviewCount: 298,
    cookTime: '2 min',
    difficulty: 'Easy',
    spiceLevel: 0,
    servingSize: '12 oz',
    calories: 80,
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=800&h=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=800&h=600&q=80',
      'https://images.unsplash.com/photo-1520970014086-2208d157c9e2?auto=format&fit=crop&w=800&h=600&q=80'
    ],
    ingredients: ['Single-Origin Coffee Beans', 'Filtered Water', 'Ice', 'Choice of Milk'],
    allergens: ['Dairy (optional)'],
    nutritionInfo: {
      calories: 80,
      protein: 2,
      carbs: 4,
      fat: 4,
      fiber: 0,
      sugar: 3
    },
    tags: ['Coffee', 'Caffeine', 'Smooth'],
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: true,
    isSpicy: false,
    isPopular: true,
    category: {
      id: 'beverages',
      name: 'Beverages',
      description: 'Refreshing drinks & smoothies',
      image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=800&h=600&q=80'
    }
  },
  {
    id: 'green-detox-juice',
    name: 'Green Detox Juice',
    description: 'Nutrient-packed green juice with kale, spinach, cucumber, celery, apple, lemon, and ginger for a healthy boost.',
    shortDescription: 'Nutrient-rich green juice with kale and spinach',
    price: '199',
    rating: '4.4',
    reviewCount: 89,
    cookTime: '5 min',
    difficulty: 'Easy',
    spiceLevel: 1,
    servingSize: '12 oz',
    calories: 120,
    image: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?auto=format&fit=crop&w=800&h=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1610970881699-44a5587cabec?auto=format&fit=crop&w=800&h=600&q=80',
      'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&w=800&h=600&q=80'
    ],
    ingredients: ['Kale', 'Spinach', 'Cucumber', 'Celery', 'Apple', 'Lemon', 'Ginger'],
    allergens: [],
    nutritionInfo: {
      calories: 120,
      protein: 4,
      carbs: 28,
      fat: 1,
      fiber: 6,
      sugar: 18
    },
    tags: ['Healthy', 'Detox', 'Vegan'],
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    isSpicy: false,
    isPopular: false,
    category: {
      id: 'beverages',
      name: 'Beverages',
      description: 'Refreshing drinks & smoothies',
      image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=800&h=600&q=80'
    }
  }
];