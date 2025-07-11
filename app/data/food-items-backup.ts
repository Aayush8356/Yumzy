export interface FoodItem {
  id: number;
  name: string;
  description: string;
  price: string;
  originalPrice?: string;
  image: string;
  category: string;
  rating: number;
  cookTime: string;
  discount?: number;
  isHot: boolean;
  calories?: number;
  isVegetarian: boolean;
  isVegan?: boolean;
  spiceLevel?: 'mild' | 'medium' | 'hot' | 'extra-hot';
  isPublic?: boolean; // For homepage display
}

export const foodItems: FoodItem[] = [
  // PUBLIC ITEMS - SHOWN ON HOMEPAGE
  {
    id: 1,
    name: "Truffle Mushroom Burger",
    description: "Premium beef patty with truffle mushroom sauce, aged cheese, and crispy onions.",
    price: "$18.99",
    originalPrice: "$24.99",
    image: "https://images.unsplash.com/photo-1607013251379-e6eecfffe234?w=500&h=400&fit=crop",
    category: "Burgers",
    rating: 4.9,
    cookTime: "15-20 min",
    discount: 25,
    isHot: true,
    calories: 650,
    isVegetarian: false,
    spiceLevel: 'mild',
    isPublic: true
  },
  {
    id: 2,
    name: "Margherita Supreme Pizza",
    description: "Fresh mozzarella, San Marzano tomatoes, basil, and premium olive oil on a wood-fired crust.",
    price: "$22.50",
    originalPrice: "$28.00",
    image: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=500&h=400&fit=crop",
    category: "Pizza",
    rating: 4.8,
    cookTime: "20-25 min",
    discount: 20,
    isHot: true,
    calories: 780,
    isVegetarian: true,
    spiceLevel: 'mild',
    isPublic: true
  },
  {
    id: 3,
    name: "Grilled Salmon Bowl",
    description: "Atlantic salmon with quinoa, avocado, edamame, and a citrus-miso dressing.",
    price: "$26.99",
    originalPrice: "$32.99",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=400&fit=crop",
    category: "Healthy",
    rating: 4.7,
    cookTime: "12-15 min",
    discount: 18,
    isHot: true,
    calories: 520,
    isVegetarian: false,
    spiceLevel: 'mild',
    isPublic: true
  },
  {
    id: 4,
    name: "Spicy Thai Ramen",
    description: "Rich tonkotsu broth with char siu pork, a soft-boiled egg, nori, and chili oil.",
    price: "$16.75",
    originalPrice: "$21.00",
    image: "https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=500&h=400&fit=crop",
    category: "Asian",
    rating: 4.9,
    cookTime: "10-15 min",
    discount: 20,
    isHot: true,
    calories: 680,
    isVegetarian: false,
    spiceLevel: 'hot',
    isPublic: true
  },
  {
    id: 5,
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with a molten center, served with vanilla ice cream and berry coulis.",
    price: "$9.99",
    originalPrice: "$12.99",
    image: "https://images.unsplash.com/photo-1542826438-63a1a3a2d1d1?w=500&h=400&fit=crop",
    category: "Desserts",
    rating: 4.8,
    cookTime: "5-8 min",
    discount: 23,
    isHot: true,
    calories: 420,
    isVegetarian: true,
    spiceLevel: 'mild',
    isPublic: true
  },
  {
    id: 6,
    name: "Mediterranean Veggie Wrap",
    description: "Grilled vegetables, hummus, cucumber, tomato, red onion, and tzatziki in a warm pita.",
    price: "$13.50",
    originalPrice: "$17.00",
    image: "https://images.unsplash.com/photo-1592487442993-99a4a71a71d9?w=500&h=400&fit=crop",
    category: "Wraps",
    rating: 4.5,
    cookTime: "8-10 min",
    discount: 20,
    isHot: false,
    calories: 450,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: 'mild',
    isPublic: true
  },

  // FULL MENU - LOGIN REQUIRED
  
  // BURGERS & SANDWICHES
  {
    id: 101,
    name: "Classic Beef Burger",
    description: "A juicy, all-beef patty with crisp lettuce, ripe tomato, onion, and our signature sauce.",
    price: "$12.99",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=400&fit=crop",
    category: "Burgers",
    rating: 4.5,
    cookTime: "12-15 min",
    isHot: false,
    calories: 580,
    isVegetarian: false,
    spiceLevel: 'mild'
  },
  {
    id: 102,
    name: "Veggie Black Bean Burger",
    description: "A house-made black bean patty topped with avocado, fresh sprouts, and a zesty chipotle mayo.",
    price: "$14.99",
    image: "https://images.unsplash.com/photo-1525059696034-4967a729002e?w=500&h=400&fit=crop",
    category: "Burgers",
    rating: 4.4,
    cookTime: "10-12 min",
    isHot: false,
    calories: 420,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: 'medium'
  },
  {
    id: 103,
    name: "Chicken Club Sandwich",
    description: "Grilled chicken breast, crispy bacon, lettuce, and tomato stacked high on toasted sourdough.",
    price: "$15.99",
    image: "https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=500&h=400&fit=crop",
    category: "Sandwiches",
    rating: 4.6,
    cookTime: "10-14 min",
    isHot: false,
    calories: 620,
    isVegetarian: false,
    spiceLevel: 'mild'
  },
  {
    id: 104,
    name: "BBQ Pulled Pork Sandwich",
    description: "Slow-cooked pulled pork smothered in our house BBQ sauce, with coleslaw on a brioche bun.",
    price: "$14.99",
    originalPrice: "$19.99",
    image: "https://images.unsplash.com/photo-1504627298434-2119d6928e93?w=500&h=400&fit=crop",
    category: "Sandwiches",
    rating: 4.6,
    cookTime: "8-12 min",
    discount: 25,
    isHot: true,
    calories: 590,
    isVegetarian: false,
    spiceLevel: 'medium'
  },
  {
    id: 105,
    name: "Grilled Portobello Sandwich",
    description: "A marinated portobello mushroom cap with roasted red peppers, pesto, and fresh mozzarella.",
    price: "$13.99",
    image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=500&h=400&fit=crop",
    category: "Sandwiches",
    rating: 4.3,
    cookTime: "8-10 min",
    isHot: false,
    calories: 380,
    isVegetarian: true,
    spiceLevel: 'mild'
  },

  // PIZZA
  {
    id: 201,
    name: "Pepperoni Classic Pizza",
    description: "A timeless classic with zesty pepperoni, mozzarella cheese, and our signature tomato sauce.",
    price: "$19.99",
    image: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=500&h=400&fit=crop",
    category: "Pizza",
    rating: 4.7,
    cookTime: "18-22 min",
    isHot: false,
    calories: 820,
    isVegetarian: false,
    spiceLevel: 'mild'
  },
  {
    id: 202,
    name: "Meat Lovers Pizza",
    description: "Loaded with pepperoni, sausage, bacon, and ham for the ultimate meat experience.",
    price: "$24.99",
    image: "https://images.unsplash.com/photo-1571407982842-bbf4e1ba7ef4?w=500&h=400&fit=crop",
    category: "Pizza",
    rating: 4.8,
    cookTime: "20-25 min",
    isHot: false,
    calories: 950,
    isVegetarian: false,
    spiceLevel: 'mild'
  },
  {
    id: 203,
    name: "Veggie Supreme Pizza",
    description: "A garden on a crust: bell peppers, mushrooms, onions, olives, and fresh tomatoes.",
    price: "$21.99",
    image: "https://images.unsplash.com/photo-1566843972142-a7fcb7080552?w=500&h=400&fit=crop",
    category: "Pizza",
    rating: 4.5,
    cookTime: "18-22 min",
    isHot: false,
    calories: 720,
    isVegetarian: true,
    spiceLevel: 'mild'
  },
  {
    id: 204,
    name: "BBQ Chicken Pizza",
    description: "Tender BBQ chicken, red onions, and fresh cilantro on a cheesy, saucy crust.",
    price: "$23.99",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&h=400&fit=crop",
    category: "Pizza",
    rating: 4.6,
    cookTime: "20-24 min",
    isHot: false,
    calories: 860,
    isVegetarian: false,
    spiceLevel: 'medium'
  },
  {
    id: 205,
    name: "Vegan Mushroom Pizza",
    description: "A delightful mix of wild mushrooms, vegan cheese, caramelized onions, and fresh herbs.",
    price: "$20.99",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&h=400&fit=crop",
    category: "Pizza",
    rating: 4.4,
    cookTime: "18-22 min",
    isHot: false,
    calories: 680,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: 'mild'
  },

  // ASIAN CUISINE
  {
    id: 301,
    name: "Chicken Teriyaki Bowl",
    description: "Grilled chicken teriyaki served over a bed of steamed rice with mixed vegetables.",
    price: "$16.99",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&h=400&fit=crop",
    category: "Asian",
    rating: 4.5,
    cookTime: "12-15 min",
    isHot: false,
    calories: 620,
    isVegetarian: false,
    spiceLevel: 'mild'
  },
  {
    id: 302,
    name: "Vegetable Pad Thai",
    description: "Stir-fried rice noodles with tofu, bean sprouts, peanuts, and a tangy tamarind sauce.",
    price: "$15.99",
    image: "https://images.unsplash.com/photo-1559847844-d724b1b2b0a8?w=500&h=400&fit=crop",
    category: "Asian",
    rating: 4.6,
    cookTime: "10-14 min",
    isHot: false,
    calories: 540,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: 'medium'
  },
  {
    id: 303,
    name: "Beef Pho",
    description: "A traditional Vietnamese soup with savory beef broth, rice noodles, and fresh herbs.",
    price: "$17.99",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&h=400&fit=crop",
    category: "Asian",
    rating: 4.8,
    cookTime: "15-18 min",
    isHot: false,
    calories: 580,
    isVegetarian: false,
    spiceLevel: 'mild'
  },
  {
    id: 304,
    name: "Kung Pao Chicken",
    description: "A spicy stir-fry of diced chicken, peanuts, vegetables, and chili peppers.",
    price: "$18.99",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&h=400&fit=crop",
    category: "Asian",
    rating: 4.7,
    cookTime: "12-16 min",
    isHot: false,
    calories: 650,
    isVegetarian: false,
    spiceLevel: 'hot'
  },
  {
    id: 305,
    name: "Vegetable Sushi Roll Set",
    description: "An assortment of fresh vegetable sushi rolls, including avocado, cucumber, and pickled radish.",
    price: "$19.99",
    image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=500&h=400&fit=crop",
    category: "Asian",
    rating: 4.4,
    cookTime: "8-12 min",
    isHot: false,
    calories: 420,
    isVegetarian: true,
    spiceLevel: 'mild'
  },

  // INDIAN CUISINE
  {
    id: 401,
    name: "Butter Chicken",
    description: "Tender chicken simmered in a rich, creamy tomato sauce with aromatic spices.",
    price: "$19.99",
    image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=500&h=400&fit=crop",
    category: "Indian",
    rating: 4.8,
    cookTime: "15-20 min",
    isHot: false,
    calories: 720,
    isVegetarian: false,
    spiceLevel: 'medium'
  },
  {
    id: 402,
    name: "Palak Paneer",
    description: "Soft cottage cheese cubes cooked in a smooth, creamy spinach curry.",
    price: "$17.99",
    image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=500&h=400&fit=crop",
    category: "Indian",
    rating: 4.6,
    cookTime: "12-15 min",
    isHot: false,
    calories: 520,
    isVegetarian: true,
    spiceLevel: 'medium'
  },
  {
    id: 403,
    name: "Chicken Biryani",
    description: "A fragrant rice dish layered with spiced chicken, saffron, and caramelized onions.",
    price: "$21.99",
    image: "https://images.unsplash.com/photo-1563379091339-03246963d29a?w=500&h=400&fit=crop",
    category: "Indian",
    rating: 4.9,
    cookTime: "20-25 min",
    isHot: false,
    calories: 780,
    isVegetarian: false,
    spiceLevel: 'hot'
  },
  {
    id: 404,
    name: "Dal Tadka",
    description: "Yellow lentils tempered with aromatic spices, garlic, and cumin seeds.",
    price: "$14.99",
    image: "https://images.unsplash.com/photo-1542826438-63a1a3a2d1d1?w=500&h=400&fit=crop",
    category: "Indian",
    rating: 4.5,
    cookTime: "10-12 min",
    isHot: false,
    calories: 380,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: 'medium'
  },
  {
    id: 405,
    name: "Tandoori Chicken",
    description: "Chicken marinated in yogurt and spices, cooked to perfection in a clay tandoor oven.",
    price: "$22.99",
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500&h=400&fit=crop",
    category: "Indian",
    rating: 4.7,
    cookTime: "18-22 min",
    isHot: false,
    calories: 650,
    isVegetarian: false,
    spiceLevel: 'hot'
  },

  // MEXICAN CUISINE
  {
    id: 501,
    name: "Chicken Burrito Bowl",
    description: "A hearty bowl of grilled chicken, rice, beans, salsa, guacamole, and cheese.",
    price: "$16.99",
    image: "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=500&h=400&fit=crop",
    category: "Mexican",
    rating: 4.6,
    cookTime: "10-12 min",
    isHot: false,
    calories: 680,
    isVegetarian: false,
    spiceLevel: 'medium'
  },
  {
    id: 502,
    name: "Veggie Quesadilla",
    description: "A grilled tortilla filled with melted cheese, bell peppers, onions, and mushrooms.",
    price: "$13.99",
    image: "https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=500&h=400&fit=crop",
    category: "Mexican",
    rating: 4.4,
    cookTime: "8-10 min",
    isHot: false,
    calories: 520,
    isVegetarian: true,
    spiceLevel: 'mild'
  },
  {
    id: 503,
    name: "Beef Tacos (3 pieces)",
    description: "Three soft tortillas filled with seasoned ground beef, lettuce, tomato, and cheese.",
    price: "$14.99",
    image: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=500&h=400&fit=crop",
    category: "Mexican",
    rating: 4.5,
    cookTime: "8-10 min",
    isHot: false,
    calories: 420,
    isVegetarian: false,
    spiceLevel: 'medium'
  },
  {
    id: 504,
    name: "Fish Tacos (3 pieces)",
    description: "Three tacos with grilled fish, crisp cabbage slaw, pico de gallo, and chipotle crema.",
    price: "$17.99",
    image: "https://images.unsplash.com/photo-1512838243191-e81e8f66f1fd?w=500&h=400&fit=crop",
    category: "Mexican",
    rating: 4.7,
    cookTime: "10-12 min",
    isHot: false,
    calories: 450,
    isVegetarian: false,
    spiceLevel: 'medium'
  },

  // HEALTHY & SALADS
  {
    id: 601,
    name: "Caesar Salad with Chicken",
    description: "Crisp romaine lettuce, grilled chicken, parmesan, croutons, and classic Caesar dressing.",
    price: "$15.99",
    image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=500&h=400&fit=crop",
    category: "Healthy",
    rating: 4.5,
    cookTime: "5-8 min",
    isHot: false,
    calories: 480,
    isVegetarian: false,
    spiceLevel: 'mild'
  },
  {
    id: 602,
    name: "Quinoa Buddha Bowl",
    description: "A nourishing bowl of quinoa, roasted vegetables, chickpeas, avocado, and tahini dressing.",
    price: "$17.99",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=400&fit=crop",
    category: "Healthy",
    rating: 4.6,
    cookTime: "8-10 min",
    isHot: false,
    calories: 520,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: 'mild'
  },
  {
    id: 603,
    name: "Grilled Chicken Power Bowl",
    description: "A protein-packed bowl with grilled chicken, brown rice, steamed broccoli, and sweet potato.",
    price: "$18.99",
    image: "https://images.unsplash.com/photo-1594041682983-7a6e3cab51a8?w=500&h=400&fit=crop",
    category: "Healthy",
    rating: 4.7,
    cookTime: "10-12 min",
    isHot: false,
    calories: 580,
    isVegetarian: false,
    spiceLevel: 'mild'
  },
  {
    id: 604,
    name: "Mediterranean Salad",
    description: "A refreshing salad with mixed greens, feta cheese, olives, tomatoes, and cucumber.",
    price: "$14.99",
    image: "https://images.unsplash.com/photo-1551248429-4097c6494637?w=500&h=400&fit=crop",
    category: "Healthy",
    rating: 4.4,
    cookTime: "5-7 min",
    isHot: false,
    calories: 380,
    isVegetarian: true,
    spiceLevel: 'mild'
  },

  // WRAPS & ROLLS
  {
    id: 701,
    name: "Buffalo Chicken Wrap",
    description: "A spicy wrap with buffalo chicken, crisp lettuce, tomato, and creamy ranch dressing.",
    price: "$14.99",
    image: "https://images.unsplash.com/photo-1598679253351-61a434d398b3?w=500&h=400&fit=crop",
    category: "Wraps",
    rating: 4.5,
    cookTime: "8-10 min",
    isHot: false,
    calories: 520,
    isVegetarian: false,
    spiceLevel: 'hot'
  },
  {
    id: 702,
    name: "Turkey Club Wrap",
    description: "A classic club with sliced turkey, crispy bacon, lettuce, tomato, and mayo in a tortilla.",
    price: "$13.99",
    image: "https://images.unsplash.com/photo-1607013251379-e6eecfffe234?w=500&h=400&fit=crop",
    category: "Wraps",
    rating: 4.4,
    cookTime: "6-8 min",
    isHot: false,
    calories: 480,
    isVegetarian: false,
    spiceLevel: 'mild'
  },
  {
    id: 703,
    name: "Hummus Veggie Wrap",
    description: "A healthy wrap with hummus, cucumbers, sprouts, tomatoes, and mixed greens in a spinach tortilla.",
    price: "$12.99",
    image: "https://images.unsplash.com/photo-1540713434306-5f5334243755?w=500&h=400&fit=crop",
    category: "Wraps",
    rating: 4.3,
    cookTime: "5-7 min",
    isHot: false,
    calories: 360,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: 'mild'
  },

  // PASTA & ITALIAN
  {
    id: 801,
    name: "Spaghetti Carbonara",
    description: "Classic spaghetti with a creamy sauce made from eggs, parmesan cheese, and crispy bacon.",
    price: "$18.99",
    image: "https://images.unsplash.com/photo-1588013273468-411962b219b8?w=500&h=400&fit=crop",
    category: "Italian",
    rating: 4.7,
    cookTime: "12-15 min",
    isHot: false,
    calories: 720,
    isVegetarian: false,
    spiceLevel: 'mild'
  },
  {
    id: 802,
    name: "Penne Arrabbiata",
    description: "Penne pasta tossed in a spicy tomato sauce with garlic and red chili flakes.",
    price: "$16.99",
    image: "https://images.unsplash.com/photo-157448428400-f2673a5e5aa6?w=500&h=400&fit=crop",
    category: "Italian",
    rating: 4.5,
    cookTime: "10-12 min",
    isHot: false,
    calories: 580,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: 'hot'
  },
  {
    id: 803,
    name: "Chicken Alfredo",
    description: "Fettuccine pasta with tender grilled chicken in a rich and creamy parmesan sauce.",
    price: "$20.99",
    image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=500&h=400&fit=crop",
    category: "Italian",
    rating: 4.6,
    cookTime: "14-16 min",
    isHot: false,
    calories: 820,
    isVegetarian: false,
    spiceLevel: 'mild'
  },
  {
    id: 804,
    name: "Margherita Pasta",
    description: "A simple yet elegant pasta with fresh tomatoes, basil, mozzarella, and a touch of olive oil.",
    price: "$17.99",
    image: "https://images.unsplash.com/photo-1598866594240-a42ea54e3425?w=500&h=400&fit=crop",
    category: "Italian",
    rating: 4.4,
    cookTime: "10-12 min",
    isHot: false,
    calories: 620,
    isVegetarian: true,
    spiceLevel: 'mild'
  },

  // DESSERTS
  {
    id: 901,
    name: "Tiramisu",
    description: "A classic Italian dessert with layers of coffee-soaked ladyfingers and creamy mascarpone.",
    price: "$8.99",
    image: "https://images.unsplash.com/photo-1571115332109-9485c0578b05?w=500&h=400&fit=crop",
    category: "Desserts",
    rating: 4.8,
    cookTime: "2-3 min",
    isHot: false,
    calories: 380,
    isVegetarian: true,
    spiceLevel: 'mild'
  },
  {
    id: 902,
    name: "New York Cheesecake",
    description: "A rich and creamy cheesecake with a graham cracker crust, topped with fresh berries.",
    price: "$7.99",
    image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=500&h=400&fit=crop",
    category: "Desserts",
    rating: 4.7,
    cookTime: "2-3 min",
    isHot: false,
    calories: 450,
    isVegetarian: true,
    spiceLevel: 'mild'
  },
  {
    id: 903,
    name: "Vegan Chocolate Mousse",
    description: "A decadent and rich chocolate mousse made from avocado and coconut cream.",
    price: "$9.99",
    image: "https://images.unsplash.com/photo-1590083743904-9e933593b8b3?w=500&h=400&fit=crop",
    category: "Desserts",
    rating: 4.5,
    cookTime: "2-3 min",
    isHot: false,
    calories: 320,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: 'mild'
  },
  {
    id: 904,
    name: "Apple Pie A La Mode",
    description: "A warm slice of classic apple pie served with a scoop of creamy vanilla ice cream.",
    price: "$8.99",
    image: "https://images.unsplash.com/photo-1572490122747-91e1399d3953?w=500&h=400&fit=crop",
    category: "Desserts",
    rating: 4.6,
    cookTime: "5-7 min",
    isHot: true,
    calories: 520,
    isVegetarian: true,
    spiceLevel: 'mild'
  },

  // BEVERAGES
  {
    id: 1001,
    name: "Fresh Orange Juice",
    description: "A refreshing glass of freshly squeezed orange juice.",
    price: "$4.99",
    image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&h=400&fit=crop",
    category: "Beverages",
    rating: 4.5,
    cookTime: "2-3 min",
    isHot: false,
    calories: 120,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: 'mild'
  },
  {
    id: 1002,
    name: "Green Smoothie",
    description: "A healthy blend of spinach, kale, apple, banana, and coconut water.",
    price: "$6.99",
    image: "https://images.unsplash.com/photo-1505252585461-1b632da5070a?w=500&h=400&fit=crop",
    category: "Beverages",
    rating: 4.4,
    cookTime: "3-5 min",
    isHot: false,
    calories: 180,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: 'mild'
  },
  {
    id: 1003,
    name: "Iced Coffee",
    description: "A smooth and strong cold brew coffee served over ice.",
    price: "$3.99",
    image: "https://images.unsplash.com/photo-1517701550927-2e3a49e5f3b9?w=500&h=400&fit=crop",
    category: "Beverages",
    rating: 4.3,
    cookTime: "2-3 min",
    isHot: false,
    calories: 5,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: 'mild'
  },
  {
    id: 1004,
    name: "Mango Lassi",
    description: "A traditional Indian yogurt drink blended with sweet mangoes and a hint of cardamom.",
    price: "$5.99",
    image: "https://images.unsplash.com/photo-1627793131893-8815a2334e45?w=500&h=400&fit=crop",
    category: "Beverages",
    rating: 4.6,
    cookTime: "2-3 min",
    isHot: false,
    calories: 220,
    isVegetarian: true,
    spiceLevel: 'mild'
  }
];

// Function to get hot deals (items marked as hot with discounts)
export const getHotDeals = (): FoodItem[] => {
  return foodItems.filter(item => item.isHot && item.discount && item.discount > 0);
};

// Function to get items by category
export const getItemsByCategory = (category: string): FoodItem[] => {
  return foodItems.filter(item => item.category.toLowerCase() === category.toLowerCase());
};

// Function to get public menu items (for homepage - no login required)
export const getPublicMenuItems = (): FoodItem[] => {
  return foodItems.filter(item => item.isPublic === true);
};

// Function to get full menu items (login required)
export const getFullMenuItems = (): FoodItem[] => {
  return foodItems;
};

// Function to get vegetarian items
export const getVegetarianItems = (): FoodItem[] => {
  return foodItems.filter(item => item.isVegetarian === true);
};

// Function to get vegan items
export const getVeganItems = (): FoodItem[] => {
  return foodItems.filter(item => item.isVegan === true);
};

// Function to get items by spice level
export const getItemsBySpiceLevel = (spiceLevel: 'mild' | 'medium' | 'hot' | 'extra-hot'): FoodItem[] => {
  return foodItems.filter(item => item.spiceLevel === spiceLevel);
};

// Function to get categories with item counts
export const getCategoriesWithCounts = (items: FoodItem[] = foodItems): Array<{category: string, count: number}> => {
  const categoryMap = new Map<string, number>();
  
  items.forEach(item => {
    const count = categoryMap.get(item.category) || 0;
    categoryMap.set(item.category, count + 1);
  });
  
  return Array.from(categoryMap.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
};

// Function to get a single featured item for the day
export const getDailyFeaturedItem = (): FoodItem => {
  const discountedItems = foodItems.filter(item => item.discount && item.discount > 0);
  if (discountedItems.length === 0) {
    // Fallback to any random item if no discounted items are available
    return foodItems[Math.floor(Math.random() * foodItems.length)];
  }
  return discountedItems[Math.floor(Math.random() * discountedItems.length)];
};
