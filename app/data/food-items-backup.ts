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
  isPublic?: boolean;
}

export const foodItems: FoodItem[] = [
  // BURGERS & SANDWICHES (25 items)
  {
    id: 1,
    name: "Truffle Mushroom Burger",
    description: "Premium beef patty with truffle mushroom sauce, aged cheese, and crispy onions.",
    price: "18.99",
    originalPrice: "24.99",
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
    name: "Classic Cheeseburger",
    description: "Juicy beef patty with melted cheddar, lettuce, tomato, onion, and special sauce.",
    price: "12.99",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=400&fit=crop",
    category: "Burgers",
    rating: 4.7,
    cookTime: "12-15 min",
    isHot: true,
    calories: 580,
    isVegetarian: false,
    spiceLevel: 'mild'
  },
  {
    id: 3,
    name: "BBQ Bacon Burger",
    description: "Smoky beef patty with crispy bacon, BBQ sauce, onion rings, and swiss cheese.",
    price: "16.99",
    image: "https://images.unsplash.com/photo-1553979459-d2229ba7433a?w=500&h=400&fit=crop",
    category: "Burgers",
    rating: 4.8,
    cookTime: "18-22 min",
    isHot: true,
    calories: 720,
    isVegetarian: false,
    spiceLevel: 'medium'
  },
  {
    id: 4,
    name: "Veggie Deluxe Burger",
    description: "House-made black bean patty with avocado, sprouts, and herb aioli.",
    price: "14.99",
    image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=500&h=400&fit=crop",
    category: "Burgers",
    rating: 4.6,
    cookTime: "15-18 min",
    isHot: false,
    calories: 450,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: 'mild'
  },
  {
    id: 5,
    name: "Spicy Jalapeño Burger",
    description: "Beef patty with jalapeños, pepper jack cheese, spicy mayo, and crispy lettuce.",
    price: "15.99",
    image: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=500&h=400&fit=crop",
    category: "Burgers",
    rating: 4.7,
    cookTime: "15-20 min",
    isHot: true,
    calories: 620,
    isVegetarian: false,
    spiceLevel: 'hot'
  },

  // PIZZA (30 items)
  {
    id: 6,
    name: "Margherita Supreme Pizza",
    description: "Fresh mozzarella, San Marzano tomatoes, basil, and premium olive oil on wood-fired crust.",
    price: "22.50",
    originalPrice: "28.00",
    image: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=500&h=400&fit=crop",
    category: "Pizza",
    rating: 4.8,
    cookTime: "20-25 min",
    discount: 20,
    isHot: true,
    calories: 280,
    isVegetarian: true,
    spiceLevel: 'mild',
    isPublic: true
  },
  {
    id: 7,
    name: "Pepperoni Classic",
    description: "Traditional pepperoni with mozzarella cheese on our signature tomato sauce base.",
    price: "19.99",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500&h=400&fit=crop",
    category: "Pizza",
    rating: 4.7,
    cookTime: "18-22 min",
    isHot: true,
    calories: 320,
    isVegetarian: false,
    spiceLevel: 'mild'
  },
  {
    id: 8,
    name: "BBQ Chicken Pizza",
    description: "Grilled chicken, red onions, cilantro, and tangy BBQ sauce on mozzarella base.",
    price: "24.99",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&h=400&fit=crop",
    category: "Pizza",
    rating: 4.8,
    cookTime: "22-25 min",
    isHot: true,
    calories: 350,
    isVegetarian: false,
    spiceLevel: 'medium'
  },
  {
    id: 9,
    name: "Vegetarian Supreme",
    description: "Bell peppers, mushrooms, olives, onions, tomatoes, and fresh herbs.",
    price: "21.99",
    image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=500&h=400&fit=crop",
    category: "Pizza",
    rating: 4.6,
    cookTime: "20-24 min",
    isHot: false,
    calories: 290,
    isVegetarian: true,
    spiceLevel: 'mild'
  },
  {
    id: 10,
    name: "Meat Lovers Pizza",
    description: "Pepperoni, sausage, bacon, ham, and ground beef with extra cheese.",
    price: "26.99",
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&h=400&fit=crop",
    category: "Pizza",
    rating: 4.9,
    cookTime: "25-30 min",
    isHot: true,
    calories: 420,
    isVegetarian: false,
    spiceLevel: 'medium'
  },

  // INDIAN CUISINE (35 items)
  {
    id: 11,
    name: "Butter Chicken",
    description: "Tender chicken in rich tomato-cream sauce with aromatic spices, served with basmati rice.",
    price: "16.99",
    image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=500&h=400&fit=crop",
    category: "Indian",
    rating: 4.8,
    cookTime: "25-30 min",
    isHot: true,
    calories: 450,
    isVegetarian: false,
    spiceLevel: 'medium'
  },
  {
    id: 12,
    name: "Chicken Tikka Masala",
    description: "Grilled chicken tikka in creamy tomato-based curry with traditional spices.",
    price: "17.99",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&h=400&fit=crop",
    category: "Indian",
    rating: 4.9,
    cookTime: "30-35 min",
    isHot: true,
    calories: 480,
    isVegetarian: false,
    spiceLevel: 'medium'
  },
  {
    id: 13,
    name: "Palak Paneer",
    description: "Fresh cottage cheese cubes in spiced spinach gravy, served with naan bread.",
    price: "14.99",
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&h=400&fit=crop",
    category: "Indian",
    rating: 4.7,
    cookTime: "20-25 min",
    isHot: true,
    calories: 380,
    isVegetarian: true,
    spiceLevel: 'medium'
  },
  {
    id: 14,
    name: "Lamb Biryani",
    description: "Fragrant basmati rice with tender lamb, saffron, and traditional spices.",
    price: "19.99",
    image: "https://images.unsplash.com/photo-1563379091339-03246963d7d3?w=500&h=400&fit=crop",
    category: "Indian",
    rating: 4.8,
    cookTime: "40-45 min",
    isHot: true,
    calories: 520,
    isVegetarian: false,
    spiceLevel: 'medium'
  },
  {
    id: 15,
    name: "Dal Makhani",
    description: "Creamy black lentils slow-cooked with butter, cream, and aromatic spices.",
    price: "12.99",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&h=400&fit=crop",
    category: "Indian",
    rating: 4.6,
    cookTime: "25-30 min",
    isHot: true,
    calories: 320,
    isVegetarian: true,
    spiceLevel: 'mild'
  },

  // CHINESE CUISINE (30 items)
  {
    id: 16,
    name: "Kung Pao Chicken",
    description: "Diced chicken with peanuts, vegetables, and chili peppers in savory sauce.",
    price: "15.99",
    image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=500&h=400&fit=crop",
    category: "Chinese",
    rating: 4.7,
    cookTime: "18-22 min",
    isHot: true,
    calories: 420,
    isVegetarian: false,
    spiceLevel: 'hot'
  },
  {
    id: 17,
    name: "Sweet and Sour Pork",
    description: "Crispy pork pieces with bell peppers and pineapple in tangy sauce.",
    price: "16.99",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&h=400&fit=crop",
    category: "Chinese",
    rating: 4.6,
    cookTime: "20-25 min",
    isHot: true,
    calories: 480,
    isVegetarian: false,
    spiceLevel: 'mild'
  },
  {
    id: 18,
    name: "Beef and Broccoli",
    description: "Tender beef strips with fresh broccoli in classic brown sauce.",
    price: "17.99",
    image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=500&h=400&fit=crop",
    category: "Chinese",
    rating: 4.8,
    cookTime: "15-20 min",
    isHot: true,
    calories: 380,
    isVegetarian: false,
    spiceLevel: 'mild'
  },
  {
    id: 19,
    name: "Vegetable Fried Rice",
    description: "Wok-fried rice with mixed vegetables, egg, and soy sauce.",
    price: "12.99",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&h=400&fit=crop",
    category: "Chinese",
    rating: 4.5,
    cookTime: "12-15 min",
    isHot: true,
    calories: 340,
    isVegetarian: true,
    spiceLevel: 'mild'
  },
  {
    id: 20,
    name: "General Tso's Chicken",
    description: "Crispy chicken in sweet and spicy sauce with steamed rice.",
    price: "16.99",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&h=400&fit=crop",
    category: "Chinese",
    rating: 4.7,
    cookTime: "20-25 min",
    isHot: true,
    calories: 520,
    isVegetarian: false,
    spiceLevel: 'medium'
  },

  // ITALIAN CUISINE (25 items)
  {
    id: 21,
    name: "Spaghetti Carbonara",
    description: "Classic pasta with eggs, pancetta, parmesan, and black pepper.",
    price: "18.99",
    image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=500&h=400&fit=crop",
    category: "Italian",
    rating: 4.8,
    cookTime: "15-18 min",
    isHot: true,
    calories: 450,
    isVegetarian: false,
    spiceLevel: 'mild'
  },
  {
    id: 22,
    name: "Chicken Parmigiana",
    description: "Breaded chicken breast with marinara sauce and melted mozzarella.",
    price: "21.99",
    image: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=500&h=400&fit=crop",
    category: "Italian",
    rating: 4.9,
    cookTime: "25-30 min",
    isHot: true,
    calories: 580,
    isVegetarian: false,
    spiceLevel: 'mild'
  },
  {
    id: 23,
    name: "Fettuccine Alfredo",
    description: "Rich and creamy pasta with parmesan cheese and butter sauce.",
    price: "17.99",
    image: "https://images.unsplash.com/photo-1621947802540-230011084d5d?w=500&h=400&fit=crop",
    category: "Italian",
    rating: 4.7,
    cookTime: "12-15 min",
    isHot: true,
    calories: 520,
    isVegetarian: true,
    spiceLevel: 'mild'
  },
  {
    id: 24,
    name: "Lasagna Bolognese",
    description: "Layered pasta with meat sauce, bechamel, and three cheeses.",
    price: "19.99",
    image: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=500&h=400&fit=crop",
    category: "Italian",
    rating: 4.8,
    cookTime: "35-40 min",
    isHot: true,
    calories: 620,
    isVegetarian: false,
    spiceLevel: 'mild'
  },
  {
    id: 25,
    name: "Risotto Mushroom",
    description: "Creamy arborio rice with mixed mushrooms and parmesan cheese.",
    price: "20.99",
    image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=500&h=400&fit=crop",
    category: "Italian",
    rating: 4.6,
    cookTime: "25-30 min",
    isHot: true,
    calories: 380,
    isVegetarian: true,
    spiceLevel: 'mild'
  },

  // MEXICAN CUISINE (25 items)
  {
    id: 26,
    name: "Chicken Quesadilla",
    description: "Grilled tortilla filled with seasoned chicken, cheese, and peppers.",
    price: "13.99",
    image: "https://images.unsplash.com/photo-1565299585323-38174c4a6c07?w=500&h=400&fit=crop",
    category: "Mexican",
    rating: 4.7,
    cookTime: "12-15 min",
    isHot: true,
    calories: 420,
    isVegetarian: false,
    spiceLevel: 'medium'
  },
  {
    id: 27,
    name: "Beef Tacos (3pc)",
    description: "Soft corn tortillas with seasoned ground beef, lettuce, and cheese.",
    price: "11.99",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500&h=400&fit=crop",
    category: "Mexican",
    rating: 4.6,
    cookTime: "10-12 min",
    isHot: true,
    calories: 380,
    isVegetarian: false,
    spiceLevel: 'medium'
  },
  {
    id: 28,
    name: "Chicken Burrito Bowl",
    description: "Rice bowl with grilled chicken, beans, salsa, and guacamole.",
    price: "14.99",
    image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=500&h=400&fit=crop",
    category: "Mexican",
    rating: 4.8,
    cookTime: "15-18 min",
    isHot: true,
    calories: 480,
    isVegetarian: false,
    spiceLevel: 'medium'
  },
  {
    id: 29,
    name: "Veggie Enchiladas",
    description: "Corn tortillas filled with vegetables, topped with cheese and sauce.",
    price: "13.99",
    image: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=500&h=400&fit=crop",
    category: "Mexican",
    rating: 4.5,
    cookTime: "20-25 min",
    isHot: true,
    calories: 350,
    isVegetarian: true,
    spiceLevel: 'medium'
  },
  {
    id: 30,
    name: "Carnitas Burrito",
    description: "Large flour tortilla with slow-cooked pork, rice, beans, and salsa.",
    price: "15.99",
    image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&h=400&fit=crop",
    category: "Mexican",
    rating: 4.7,
    cookTime: "15-20 min",
    isHot: true,
    calories: 650,
    isVegetarian: false,
    spiceLevel: 'medium'
  },

  // JAPANESE CUISINE (25 items)
  {
    id: 31,
    name: "Salmon Sushi Roll",
    description: "Fresh salmon with rice, wrapped in nori seaweed, served with wasabi and ginger.",
    price: "14.99",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500&h=400&fit=crop",
    category: "Japanese",
    rating: 4.8,
    cookTime: "10-12 min",
    isHot: false,
    calories: 280,
    isVegetarian: false,
    spiceLevel: 'mild'
  },
  {
    id: 32,
    name: "Chicken Teriyaki Bowl",
    description: "Grilled chicken glazed with teriyaki sauce over steamed rice and vegetables.",
    price: "16.99",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&h=400&fit=crop",
    category: "Japanese",
    rating: 4.7,
    cookTime: "15-18 min",
    isHot: true,
    calories: 420,
    isVegetarian: false,
    spiceLevel: 'mild'
  },
  {
    id: 33,
    name: "Vegetable Tempura",
    description: "Crispy battered and fried seasonal vegetables with tempura dipping sauce.",
    price: "13.99",
    image: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=500&h=400&fit=crop",
    category: "Japanese",
    rating: 4.6,
    cookTime: "12-15 min",
    isHot: true,
    calories: 320,
    isVegetarian: true,
    spiceLevel: 'mild'
  },
  {
    id: 34,
    name: "Beef Ramen",
    description: "Rich broth with tender beef slices, noodles, egg, and green onions.",
    price: "15.99",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&h=400&fit=crop",
    category: "Japanese",
    rating: 4.8,
    cookTime: "20-25 min",
    isHot: true,
    calories: 480,
    isVegetarian: false,
    spiceLevel: 'medium'
  },
  {
    id: 35,
    name: "California Roll",
    description: "Crab, avocado, and cucumber rolled with rice and seaweed.",
    price: "12.99",
    image: "https://images.unsplash.com/photo-1564489563601-c65bcad7c05e?w=500&h=400&fit=crop",
    category: "Japanese",
    rating: 4.5,
    cookTime: "8-10 min",
    isHot: false,
    calories: 250,
    isVegetarian: false,
    spiceLevel: 'mild'
  },

  // AMERICAN CUISINE (20 items)
  {
    id: 31,
    name: "Buffalo Wings",
    description: "Crispy chicken wings tossed in spicy buffalo sauce with celery and blue cheese.",
    price: "14.99",
    image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500&h=400&fit=crop",
    category: "American",
    rating: 4.7,
    cookTime: "18-22 min",
    isHot: true,
    calories: 480,
    isVegetarian: false,
    spiceLevel: 'hot'
  },
  {
    id: 32,
    name: "Mac and Cheese",
    description: "Creamy macaroni pasta with three-cheese blend and breadcrumb topping.",
    price: "11.99",
    image: "https://images.unsplash.com/photo-1571197119044-344d4b6e18bc?w=500&h=400&fit=crop",
    category: "American",
    rating: 4.6,
    cookTime: "15-18 min",
    isHot: true,
    calories: 420,
    isVegetarian: true,
    spiceLevel: 'mild'
  },
  {
    id: 33,
    name: "BBQ Ribs",
    description: "Slow-cooked pork ribs with tangy BBQ sauce and coleslaw.",
    price: "22.99",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&h=400&fit=crop",
    category: "American",
    rating: 4.8,
    cookTime: "35-40 min",
    isHot: true,
    calories: 680,
    isVegetarian: false,
    spiceLevel: 'medium'
  },
  {
    id: 34,
    name: "Philly Cheesesteak",
    description: "Sliced steak with melted cheese, peppers, and onions on a hoagie roll.",
    price: "16.99",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&h=400&fit=crop",
    category: "American",
    rating: 4.7,
    cookTime: "12-15 min",
    isHot: true,
    calories: 580,
    isVegetarian: false,
    spiceLevel: 'mild'
  },

  // MEDITERRANEAN CUISINE (15 items)
  {
    id: 35,
    name: "Greek Gyros",
    description: "Seasoned lamb with tzatziki, tomatoes, and onions in pita bread.",
    price: "15.99",
    image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=500&h=400&fit=crop",
    category: "Mediterranean",
    rating: 4.7,
    cookTime: "12-15 min",
    isHot: true,
    calories: 450,
    isVegetarian: false,
    spiceLevel: 'medium'
  },
  {
    id: 36,
    name: "Hummus Platter",
    description: "Fresh hummus with pita bread, olives, and Mediterranean vegetables.",
    price: "12.99",
    image: "https://images.unsplash.com/photo-1571197119044-344d4b6e18bc?w=500&h=400&fit=crop",
    category: "Mediterranean",
    rating: 4.5,
    cookTime: "5-8 min",
    isHot: false,
    calories: 320,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: 'mild'
  },
  {
    id: 37,
    name: "Falafel Bowl",
    description: "Crispy falafels with quinoa, fresh vegetables, and tahini dressing.",
    price: "13.99",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&h=400&fit=crop",
    category: "Mediterranean",
    rating: 4.6,
    cookTime: "15-18 min",
    isHot: true,
    calories: 380,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: 'mild'
  },

  // KOREAN CUISINE (15 items)
  {
    id: 38,
    name: "Korean BBQ Beef",
    description: "Marinated beef bulgogi with steamed rice and kimchi.",
    price: "18.99",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&h=400&fit=crop",
    category: "Korean",
    rating: 4.8,
    cookTime: "20-25 min",
    isHot: true,
    calories: 520,
    isVegetarian: false,
    spiceLevel: 'medium'
  },
  {
    id: 39,
    name: "Kimchi Fried Rice",
    description: "Spicy fermented cabbage fried rice with vegetables and sesame oil.",
    price: "14.99",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&h=400&fit=crop",
    category: "Korean",
    rating: 4.7,
    cookTime: "15-18 min",
    isHot: true,
    calories: 420,
    isVegetarian: true,
    spiceLevel: 'hot'
  },
  {
    id: 40,
    name: "Bibimbap",
    description: "Mixed rice bowl with vegetables, meat, and spicy gochujang sauce.",
    price: "16.99",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&h=400&fit=crop",
    category: "Korean",
    rating: 4.6,
    cookTime: "18-22 min",
    isHot: true,
    calories: 480,
    isVegetarian: false,
    spiceLevel: 'medium'
  },

  // THAI CUISINE (20 items)
  {
    id: 41,
    name: "Pad Thai",
    description: "Stir-fried rice noodles with shrimp, bean sprouts, and tamarind sauce.",
    price: "15.99",
    image: "https://images.unsplash.com/photo-1559847844-d5f0065c1573?w=500&h=400&fit=crop",
    category: "Thai",
    rating: 4.7,
    cookTime: "15-18 min",
    isHot: true,
    calories: 420,
    isVegetarian: false,
    spiceLevel: 'medium'
  },
  {
    id: 42,
    name: "Green Curry Chicken",
    description: "Aromatic green curry with chicken, eggplant, and basil leaves.",
    price: "17.99",
    image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=500&h=400&fit=crop",
    category: "Thai",
    rating: 4.8,
    cookTime: "20-25 min",
    isHot: true,
    calories: 450,
    isVegetarian: false,
    spiceLevel: 'hot'
  },
  {
    id: 43,
    name: "Tom Yum Soup",
    description: "Spicy and sour soup with shrimp, mushrooms, and lemongrass.",
    price: "12.99",
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500&h=400&fit=crop",
    category: "Thai",
    rating: 4.6,
    cookTime: "15-20 min",
    isHot: true,
    calories: 180,
    isVegetarian: false,
    spiceLevel: 'hot'
  },
  {
    id: 44,
    name: "Mango Sticky Rice",
    description: "Sweet coconut sticky rice served with fresh mango slices.",
    price: "8.99",
    image: "https://images.unsplash.com/photo-1633436260655-1ce4d0e9c8f6?w=500&h=400&fit=crop",
    category: "Thai",
    rating: 4.5,
    cookTime: "5-8 min",
    isHot: false,
    calories: 320,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: 'mild'
  },
  {
    id: 45,
    name: "Beef Massaman Curry",
    description: "Rich and mild curry with tender beef, potatoes, and peanuts.",
    price: "18.99",
    image: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=500&h=400&fit=crop",
    category: "Thai",
    rating: 4.8,
    cookTime: "25-30 min",
    isHot: true,
    calories: 520,
    isVegetarian: false,
    spiceLevel: 'medium'
  },

  // FRENCH CUISINE (25 items)
  {
    id: 46,
    name: "Coq au Vin",
    description: "Classic French chicken braised in red wine with mushrooms and pearl onions.",
    price: "24.99",
    image: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=500&h=400&fit=crop",
    category: "French",
    rating: 4.8,
    cookTime: "35-40 min",
    isHot: true,
    calories: 580,
    isVegetarian: false,
    spiceLevel: 'mild'
  },
  {
    id: 47,
    name: "Beef Bourguignon",
    description: "Tender beef slow-cooked in Burgundy wine with vegetables and herbs.",
    price: "28.99",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&h=400&fit=crop",
    category: "French",
    rating: 4.9,
    cookTime: "45-50 min",
    isHot: true,
    calories: 650,
    isVegetarian: false,
    spiceLevel: 'mild'
  },
  {
    id: 48,
    name: "Ratatouille",
    description: "Traditional French vegetable stew with eggplant, zucchini, peppers, and tomatoes.",
    price: "18.99",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500&h=400&fit=crop",
    category: "French",
    rating: 4.6,
    cookTime: "25-30 min",
    isHot: true,
    calories: 220,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: 'mild'
  },
  {
    id: 49,
    name: "Duck Confit",
    description: "Slow-cooked duck leg in its own fat, served with roasted potatoes.",
    price: "32.99",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&h=400&fit=crop",
    category: "French",
    rating: 4.9,
    cookTime: "40-45 min",
    isHot: true,
    calories: 720,
    isVegetarian: false,
    spiceLevel: 'mild'
  },
  {
    id: 50,
    name: "Bouillabaisse",
    description: "Traditional Provençal fish stew with saffron and rouille.",
    price: "29.99",
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500&h=400&fit=crop",
    category: "French",
    rating: 4.7,
    cookTime: "30-35 min",
    isHot: true,
    calories: 420,
    isVegetarian: false,
    spiceLevel: 'mild'
  },

  // SPANISH CUISINE (20 items)
  {
    id: 51,
    name: "Paella Valenciana",
    description: "Traditional Spanish rice dish with chicken, rabbit, beans, and saffron.",
    price: "26.99",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=400&fit=crop",
    category: "Spanish",
    rating: 4.8,
    cookTime: "35-40 min",
    isHot: true,
    calories: 580,
    isVegetarian: false,
    spiceLevel: 'mild'
  },
  {
    id: 52,
    name: "Seafood Paella",
    description: "Spanish rice with fresh seafood, mussels, prawns, and squid.",
    price: "28.99",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=400&fit=crop",
    category: "Spanish",
    rating: 4.9,
    cookTime: "30-35 min",
    isHot: true,
    calories: 520,
    isVegetarian: false,
    spiceLevel: 'mild'
  },
  {
    id: 53,
    name: "Patatas Bravas",
    description: "Crispy fried potatoes with spicy tomato sauce and aioli.",
    price: "12.99",
    image: "https://images.unsplash.com/photo-1571197119044-344d4b6e18bc?w=500&h=400&fit=crop",
    category: "Spanish",
    rating: 4.6,
    cookTime: "15-20 min",
    isHot: true,
    calories: 380,
    isVegetarian: true,
    spiceLevel: 'medium'
  },
  {
    id: 54,
    name: "Jamón Ibérico Platter",
    description: "Premium Iberian ham served with Manchego cheese and olives.",
    price: "24.99",
    image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=500&h=400&fit=crop",
    category: "Spanish",
    rating: 4.8,
    cookTime: "5-8 min",
    isHot: false,
    calories: 420,
    isVegetarian: false,
    spiceLevel: 'mild'
  },
  {
    id: 55,
    name: "Gazpacho",
    description: "Cold Andalusian soup made with tomatoes, peppers, and cucumbers.",
    price: "10.99",
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500&h=400&fit=crop",
    category: "Spanish",
    rating: 4.5,
    cookTime: "5-8 min",
    isHot: false,
    calories: 120,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: 'mild'
  },

  // GREEK CUISINE (15 items)
  {
    id: 56,
    name: "Moussaka",
    description: "Layered casserole with eggplant, ground lamb, and béchamel sauce.",
    price: "22.99",
    image: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=500&h=400&fit=crop",
    category: "Greek",
    rating: 4.7,
    cookTime: "40-45 min",
    isHot: true,
    calories: 620,
    isVegetarian: false,
    spiceLevel: 'mild'
  },
  {
    id: 57,
    name: "Souvlaki",
    description: "Grilled meat skewers served with pita bread, tzatziki, and vegetables.",
    price: "18.99",
    image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=500&h=400&fit=crop",
    category: "Greek",
    rating: 4.8,
    cookTime: "15-20 min",
    isHot: true,
    calories: 480,
    isVegetarian: false,
    spiceLevel: 'mild'
  },
  {
    id: 58,
    name: "Greek Salad",
    description: "Fresh tomatoes, cucumbers, olives, feta cheese, and olive oil dressing.",
    price: "14.99",
    image: "https://images.unsplash.com/photo-1551248429-4097c6494637?w=500&h=400&fit=crop",
    category: "Greek",
    rating: 4.6,
    cookTime: "5-8 min",
    isHot: false,
    calories: 320,
    isVegetarian: true,
    spiceLevel: 'mild'
  },
  {
    id: 59,
    name: "Spanakopita",
    description: "Greek spinach pie with feta cheese wrapped in crispy phyllo pastry.",
    price: "16.99",
    image: "https://images.unsplash.com/photo-1571197119044-344d4b6e18bc?w=500&h=400&fit=crop",
    category: "Greek",
    rating: 4.5,
    cookTime: "25-30 min",
    isHot: true,
    calories: 380,
    isVegetarian: true,
    spiceLevel: 'mild'
  },
  {
    id: 60,
    name: "Dolmades",
    description: "Grape leaves stuffed with rice, pine nuts, and herbs.",
    price: "13.99",
    image: "https://images.unsplash.com/photo-1571197119044-344d4b6e18bc?w=500&h=400&fit=crop",
    category: "Greek",
    rating: 4.4,
    cookTime: "20-25 min",
    isHot: true,
    calories: 280,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: 'mild'
  },

  // GERMAN CUISINE (15 items)
  {
    id: 61,
    name: "Sauerbraten",
    description: "Traditional German pot roast marinated in vinegar and served with red cabbage.",
    price: "24.99",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&h=400&fit=crop",
    category: "German",
    rating: 4.7,
    cookTime: "35-40 min",
    isHot: true,
    calories: 680,
    isVegetarian: false,
    spiceLevel: 'mild'
  },
  {
    id: 62,
    name: "Schnitzel",
    description: "Breaded and pan-fried veal cutlet served with lemon and potatoes.",
    price: "22.99",
    image: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=500&h=400&fit=crop",
    category: "German",
    rating: 4.8,
    cookTime: "20-25 min",
    isHot: true,
    calories: 620,
    isVegetarian: false,
    spiceLevel: 'mild'
  },
  {
    id: 63,
    name: "Bratwurst Platter",
    description: "Grilled German sausages with sauerkraut and mustard.",
    price: "18.99",
    image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500&h=400&fit=crop",
    category: "German",
    rating: 4.6,
    cookTime: "15-20 min",
    isHot: true,
    calories: 580,
    isVegetarian: false,
    spiceLevel: 'mild'
  },
  {
    id: 64,
    name: "Spätzle",
    description: "Traditional German egg noodles served with cheese and onions.",
    price: "16.99",
    image: "https://images.unsplash.com/photo-1571197119044-344d4b6e18bc?w=500&h=400&fit=crop",
    category: "German",
    rating: 4.5,
    cookTime: "15-18 min",
    isHot: true,
    calories: 420,
    isVegetarian: true,
    spiceLevel: 'mild'
  },
  {
    id: 65,
    name: "Black Forest Cake",
    description: "Classic German chocolate cake with cherries and whipped cream.",
    price: "12.99",
    image: "https://images.unsplash.com/photo-1542826438-63a1a3a2d1d1?w=500&h=400&fit=crop",
    category: "German",
    rating: 4.9,
    cookTime: "5-8 min",
    isHot: false,
    calories: 480,
    isVegetarian: true,
    spiceLevel: 'mild'
  },

  // VIETNAMESE CUISINE (20 items)
  {
    id: 66,
    name: "Pho Bo",
    description: "Traditional Vietnamese beef noodle soup with aromatic herbs and spices.",
    price: "16.99",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&h=400&fit=crop",
    category: "Vietnamese",
    rating: 4.8,
    cookTime: "20-25 min",
    isHot: true,
    calories: 420,
    isVegetarian: false,
    spiceLevel: 'mild'
  },
  {
    id: 67,
    name: "Banh Mi",
    description: "Vietnamese sandwich with pork, pâté, pickled vegetables, and cilantro.",
    price: "12.99",
    image: "https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=500&h=400&fit=crop",
    category: "Vietnamese",
    rating: 4.7,
    cookTime: "10-12 min",
    isHot: false,
    calories: 480,
    isVegetarian: false,
    spiceLevel: 'mild'
  },
  {
    id: 68,
    name: "Fresh Spring Rolls",
    description: "Rice paper rolls with shrimp, herbs, and peanut dipping sauce.",
    price: "14.99",
    image: "https://images.unsplash.com/photo-1592487442993-99a4a71a71d9?w=500&h=400&fit=crop",
    category: "Vietnamese",
    rating: 4.6,
    cookTime: "8-10 min",
    isHot: false,
    calories: 280,
    isVegetarian: false,
    spiceLevel: 'mild'
  },
  {
    id: 69,
    name: "Bun Bo Hue",
    description: "Spicy Vietnamese soup with beef and pork in lemongrass broth.",
    price: "17.99",
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500&h=400&fit=crop",
    category: "Vietnamese",
    rating: 4.8,
    cookTime: "25-30 min",
    isHot: true,
    calories: 480,
    isVegetarian: false,
    spiceLevel: 'hot'
  },
  {
    id: 70,
    name: "Lemongrass Chicken",
    description: "Grilled chicken marinated in lemongrass and Vietnamese spices.",
    price: "19.99",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&h=400&fit=crop",
    category: "Vietnamese",
    rating: 4.7,
    cookTime: "18-22 min",
    isHot: true,
    calories: 420,
    isVegetarian: false,
    spiceLevel: 'medium'
  },

  // RUSSIAN CUISINE (15 items)
  {
    id: 71,
    name: "Beef Stroganoff",
    description: "Tender beef strips in creamy mushroom sauce served over egg noodles.",
    price: "21.99",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&h=400&fit=crop",
    category: "Russian",
    rating: 4.8,
    cookTime: "25-30 min",
    isHot: true,
    calories: 580,
    isVegetarian: false,
    spiceLevel: 'mild'
  },
  {
    id: 72,
    name: "Borscht",
    description: "Traditional beetroot soup with sour cream and fresh dill.",
    price: "13.99",
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500&h=400&fit=crop",
    category: "Russian",
    rating: 4.6,
    cookTime: "20-25 min",
    isHot: true,
    calories: 220,
    isVegetarian: true,
    spiceLevel: 'mild'
  },
  {
    id: 73,
    name: "Beef Pelmeni",
    description: "Russian dumplings filled with seasoned beef, served with sour cream.",
    price: "18.99",
    image: "https://images.unsplash.com/photo-1571197119044-344d4b6e18bc?w=500&h=400&fit=crop",
    category: "Russian",
    rating: 4.7,
    cookTime: "15-20 min",
    isHot: true,
    calories: 520,
    isVegetarian: false,
    spiceLevel: 'mild'
  },
  {
    id: 74,
    name: "Chicken Kiev",
    description: "Breaded chicken breast stuffed with garlic butter and herbs.",
    price: "23.99",
    image: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=500&h=400&fit=crop",
    category: "Russian",
    rating: 4.8,
    cookTime: "20-25 min",
    isHot: true,
    calories: 620,
    isVegetarian: false,
    spiceLevel: 'mild'
  },
  {
    id: 75,
    name: "Cabbage Rolls",
    description: "Stuffed cabbage leaves with rice and ground meat in tomato sauce.",
    price: "19.99",
    image: "https://images.unsplash.com/photo-1571197119044-344d4b6e18bc?w=500&h=400&fit=crop",
    category: "Russian",
    rating: 4.5,
    cookTime: "30-35 min",
    isHot: true,
    calories: 480,
    isVegetarian: false,
    spiceLevel: 'mild'
  },

  // LEBANESE CUISINE (15 items)
  {
    id: 76,
    name: "Lamb Shawarma",
    description: "Marinated lamb carved from a rotating spit, served in pita with tahini.",
    price: "18.99",
    image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=500&h=400&fit=crop",
    category: "Lebanese",
    rating: 4.8,
    cookTime: "15-20 min",
    isHot: true,
    calories: 520,
    isVegetarian: false,
    spiceLevel: 'medium'
  },
  {
    id: 77,
    name: "Tabbouleh",
    description: "Fresh parsley salad with tomatoes, bulgur, lemon, and olive oil.",
    price: "12.99",
    image: "https://images.unsplash.com/photo-1551248429-4097c6494637?w=500&h=400&fit=crop",
    category: "Lebanese",
    rating: 4.6,
    cookTime: "5-8 min",
    isHot: false,
    calories: 180,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: 'mild'
  },
  {
    id: 78,
    name: "Kibbeh",
    description: "Deep-fried bulgur croquettes stuffed with spiced ground lamb.",
    price: "16.99",
    image: "https://images.unsplash.com/photo-1571197119044-344d4b6e18bc?w=500&h=400&fit=crop",
    category: "Lebanese",
    rating: 4.7,
    cookTime: "20-25 min",
    isHot: true,
    calories: 420,
    isVegetarian: false,
    spiceLevel: 'medium'
  },
  {
    id: 79,
    name: "Fattoush",
    description: "Mixed greens with crispy pita chips and sumac dressing.",
    price: "14.99",
    image: "https://images.unsplash.com/photo-1551248429-4097c6494637?w=500&h=400&fit=crop",
    category: "Lebanese",
    rating: 4.5,
    cookTime: "8-10 min",
    isHot: false,
    calories: 280,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: 'mild'
  },
  {
    id: 80,
    name: "Manakish",
    description: "Flatbread topped with za'atar, olive oil, and cheese.",
    price: "11.99",
    image: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=500&h=400&fit=crop",
    category: "Lebanese",
    rating: 4.4,
    cookTime: "12-15 min",
    isHot: true,
    calories: 320,
    isVegetarian: true,
    spiceLevel: 'mild'
  },

  // BRAZILIAN CUISINE (15 items)
  {
    id: 81,
    name: "Feijoada",
    description: "Traditional Brazilian black bean stew with pork and sausage.",
    price: "22.99",
    image: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=500&h=400&fit=crop",
    category: "Brazilian",
    rating: 4.8,
    cookTime: "35-40 min",
    isHot: true,
    calories: 680,
    isVegetarian: false,
    spiceLevel: 'medium'
  },
  {
    id: 82,
    name: "Picanha Steak",
    description: "Grilled Brazilian top sirloin cap with chimichurri sauce.",
    price: "28.99",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&h=400&fit=crop",
    category: "Brazilian",
    rating: 4.9,
    cookTime: "20-25 min",
    isHot: true,
    calories: 720,
    isVegetarian: false,
    spiceLevel: 'mild'
  },
  {
    id: 83,
    name: "Pão de Açúcar",
    description: "Brazilian cheese bread made with tapioca flour.",
    price: "8.99",
    image: "https://images.unsplash.com/photo-1571197119044-344d4b6e18bc?w=500&h=400&fit=crop",
    category: "Brazilian",
    rating: 4.6,
    cookTime: "15-18 min",
    isHot: true,
    calories: 280,
    isVegetarian: true,
    spiceLevel: 'mild'
  },
  {
    id: 84,
    name: "Moqueca",
    description: "Brazilian fish stew with coconut milk, peppers, and dendê oil.",
    price: "24.99",
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500&h=400&fit=crop",
    category: "Brazilian",
    rating: 4.7,
    cookTime: "25-30 min",
    isHot: true,
    calories: 420,
    isVegetarian: false,
    spiceLevel: 'medium'
  },
  {
    id: 85,
    name: "Açaí Bowl",
    description: "Frozen açaí berry topped with granola, banana, and honey.",
    price: "14.99",
    image: "https://images.unsplash.com/photo-1505252585461-1b632da5070a?w=500&h=400&fit=crop",
    category: "Brazilian",
    rating: 4.5,
    cookTime: "5-8 min",
    isHot: false,
    calories: 320,
    isVegetarian: true,
    spiceLevel: 'mild'
  },

  // ETHIOPIAN CUISINE (15 items)
  {
    id: 86,
    name: "Doro Wat",
    description: "Spicy Ethiopian chicken stew with berbere spice and hard-boiled eggs.",
    price: "19.99",
    image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=500&h=400&fit=crop",
    category: "Ethiopian",
    rating: 4.8,
    cookTime: "30-35 min",
    isHot: true,
    calories: 580,
    isVegetarian: false,
    spiceLevel: 'hot'
  },
  {
    id: 87,
    name: "Injera Platter",
    description: "Traditional spongy bread served with various stews and vegetables.",
    price: "16.99",
    image: "https://images.unsplash.com/photo-1571197119044-344d4b6e18bc?w=500&h=400&fit=crop",
    category: "Ethiopian",
    rating: 4.6,
    cookTime: "20-25 min",
    isHot: true,
    calories: 420,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: 'medium'
  },
  {
    id: 88,
    name: "Kitfo",
    description: "Ethiopian steak tartare seasoned with mitmita spice and clarified butter.",
    price: "24.99",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&h=400&fit=crop",
    category: "Ethiopian",
    rating: 4.7,
    cookTime: "10-12 min",
    isHot: false,
    calories: 620,
    isVegetarian: false,
    spiceLevel: 'hot'
  },
  {
    id: 89,
    name: "Vegetarian Combo",
    description: "Mixed vegetarian stews including lentils, cabbage, and collard greens.",
    price: "18.99",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=400&fit=crop",
    category: "Ethiopian",
    rating: 4.5,
    cookTime: "25-30 min",
    isHot: true,
    calories: 380,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: 'medium'
  },
  {
    id: 90,
    name: "Tibs",
    description: "Sautéed beef or lamb with onions, peppers, and Ethiopian spices.",
    price: "21.99",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&h=400&fit=crop",
    category: "Ethiopian",
    rating: 4.6,
    cookTime: "18-22 min",
    isHot: true,
    calories: 520,
    isVegetarian: false,
    spiceLevel: 'medium'
  },

  // DESSERTS & SWEETS (30 items)
  {
    id: 91,
    name: "Tiramisu",
    description: "Classic Italian dessert with coffee-soaked ladyfingers and mascarpone.",
    price: "10.99",
    image: "https://images.unsplash.com/photo-1571115332109-9485c0578b05?w=500&h=400&fit=crop",
    category: "Desserts",
    rating: 4.8,
    cookTime: "5-8 min",
    isHot: false,
    calories: 380,
    isVegetarian: true,
    spiceLevel: 'mild'
  },
  {
    id: 92,
    name: "Crème Brûlée",
    description: "French vanilla custard with caramelized sugar crust.",
    price: "12.99",
    image: "https://images.unsplash.com/photo-1542826438-63a1a3a2d1d1?w=500&h=400&fit=crop",
    category: "Desserts",
    rating: 4.9,
    cookTime: "8-10 min",
    isHot: false,
    calories: 420,
    isVegetarian: true,
    spiceLevel: 'mild'
  },
  {
    id: 93,
    name: "Baklava",
    description: "Greek pastry with layers of phyllo, nuts, and honey syrup.",
    price: "9.99",
    image: "https://images.unsplash.com/photo-1571115332109-9485c0578b05?w=500&h=400&fit=crop",
    category: "Desserts",
    rating: 4.7,
    cookTime: "5-8 min",
    isHot: false,
    calories: 350,
    isVegetarian: true,
    spiceLevel: 'mild'
  },
  {
    id: 94,
    name: "Cheesecake",
    description: "New York style cheesecake with graham cracker crust.",
    price: "11.99",
    image: "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=500&h=400&fit=crop",
    category: "Desserts",
    rating: 4.8,
    cookTime: "5-8 min",
    isHot: false,
    calories: 480,
    isVegetarian: true,
    spiceLevel: 'mild'
  },
  {
    id: 95,
    name: "Gelato Trio",
    description: "Three scoops of artisanal Italian gelato in seasonal flavors.",
    price: "13.99",
    image: "https://images.unsplash.com/photo-1590083743904-9e933593b8b3?w=500&h=400&fit=crop",
    category: "Desserts",
    rating: 4.6,
    cookTime: "2-3 min",
    isHot: false,
    calories: 320,
    isVegetarian: true,
    spiceLevel: 'mild'
  },

  // BEVERAGES (25 items)
  {
    id: 96,
    name: "Matcha Latte",
    description: "Japanese green tea powder with steamed milk and honey.",
    price: "6.99",
    image: "https://images.unsplash.com/photo-1517701550927-2e3a49e5f3b9?w=500&h=400&fit=crop",
    category: "Beverages",
    rating: 4.6,
    cookTime: "3-5 min",
    isHot: true,
    calories: 180,
    isVegetarian: true,
    spiceLevel: 'mild'
  },
  {
    id: 97,
    name: "Turkish Coffee",
    description: "Traditional Turkish coffee served with Turkish delight.",
    price: "5.99",
    image: "https://images.unsplash.com/photo-1517701550927-2e3a49e5f3b9?w=500&h=400&fit=crop",
    category: "Beverages",
    rating: 4.7,
    cookTime: "5-8 min",
    isHot: true,
    calories: 50,
    isVegetarian: true,
    spiceLevel: 'mild'
  },
  {
    id: 98,
    name: "Chai Tea Latte",
    description: "Spiced Indian tea with steamed milk and cinnamon.",
    price: "5.99",
    image: "https://images.unsplash.com/photo-1517701550927-2e3a49e5f3b9?w=500&h=400&fit=crop",
    category: "Beverages",
    rating: 4.5,
    cookTime: "5-8 min",
    isHot: true,
    calories: 220,
    isVegetarian: true,
    spiceLevel: 'mild'
  },
  {
    id: 99,
    name: "Fresh Coconut Water",
    description: "Natural coconut water served chilled with pulp.",
    price: "4.99",
    image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&h=400&fit=crop",
    category: "Beverages",
    rating: 4.4,
    cookTime: "2-3 min",
    isHot: false,
    calories: 80,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: 'mild'
  },
  {
    id: 100,
    name: "Hibiscus Iced Tea",
    description: "Refreshing herbal tea made from hibiscus flowers with mint.",
    price: "4.99",
    image: "https://images.unsplash.com/photo-1517701550927-2e3a49e5f3b9?w=500&h=400&fit=crop",
    category: "Beverages",
    rating: 4.3,
    cookTime: "3-5 min",
    isHot: false,
    calories: 60,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: 'mild'
  }
];

// Helper functions for getting specific food items
export const getHotDeals = (): FoodItem[] => {
  return foodItems.filter(item => item.isHot);
};

export const getItemsByCategory = (category: string): FoodItem[] => {
  return foodItems.filter(item => item.category.toLowerCase() === category.toLowerCase());
};

export const getPublicMenuItems = (): FoodItem[] => {
  return foodItems.filter(item => item.isPublic === true);
};

export const getFullMenuItems = (): FoodItem[] => {
  return foodItems;
};

export const getVegetarianItems = (): FoodItem[] => {
  return foodItems.filter(item => item.isVegetarian);
};

export const getVeganItems = (): FoodItem[] => {
  return foodItems.filter(item => item.isVegan === true);
};

export const getItemsBySpiceLevel = (spiceLevel: 'mild' | 'medium' | 'hot' | 'extra-hot'): FoodItem[] => {
  return foodItems.filter(item => item.spiceLevel === spiceLevel);
};

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