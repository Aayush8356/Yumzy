export interface FoodItem {
  id: string;
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
    id: "1",
    name: "Truffle Mushroom Burger",
    description: "Premium beef patty with truffle mushroom sauce, aged cheese, and crispy onions.",
    price: "₹450",
    originalPrice: "₹550",
    image: "https://images.unsplash.com/photo-1607013251379-e6eecfffe234?w=500&h=400&fit=crop",
    category: "Burgers",
    rating: 4.9,
    cookTime: "15-20 min",
    discount: 18,
    isHot: true,
    calories: 650,
    isVegetarian: false,
    spiceLevel: 'mild',
    isPublic: true
  },
  {
    id: "2",
    name: "Classic Cheeseburger",
    description: "Juicy beef patty with melted cheddar, lettuce, tomato, onion, and special sauce.",
    price: "₹280",
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
    id: "3",
    name: "BBQ Bacon Burger",
    description: "Smoky beef patty with crispy bacon, BBQ sauce, onion rings, and swiss cheese.",
    price: "₹380",
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
    id: "4",
    name: "Veggie Deluxe Burger",
    description: "House-made black bean patty with avocado, sprouts, and herb aioli.",
    price: "₹220",
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
    id: "5",
    name: "Spicy Jalapeño Burger",
    description: "Beef patty with jalapeños, pepper jack cheese, spicy mayo, and crispy lettuce.",
    price: "₹320",
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
    id: "6",
    name: "Margherita Supreme Pizza",
    description: "Fresh mozzarella, San Marzano tomatoes, basil, and premium olive oil on wood-fired crust.",
    price: "₹350",
    originalPrice: "₹450",
    image: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=500&h=400&fit=crop",
    category: "Pizza",
    rating: 4.8,
    cookTime: "20-25 min",
    discount: 22,
    isHot: true,
    calories: 280,
    isVegetarian: true,
    spiceLevel: 'mild',
    isPublic: true
  },
  {
    id: "7",
    name: "Pepperoni Classic",
    description: "Traditional pepperoni with mozzarella cheese on our signature tomato sauce base.",
    price: "₹420",
    originalPrice: "₹520",
    discount: 19,
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
    id: "8",
    name: "BBQ Chicken Pizza",
    description: "Grilled chicken, red onions, cilantro, and tangy BBQ sauce on mozzarella base.",
    price: "₹480",
    originalPrice: "₹580",
    discount: 17,
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
    id: "9",
    name: "Vegetarian Supreme",
    description: "Bell peppers, mushrooms, olives, onions, tomatoes, and fresh herbs.",
    price: "₹380",
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
    id: "10",
    name: "Meat Lovers Pizza",
    description: "Pepperoni, sausage, bacon, ham, and ground beef with extra cheese.",
    price: "₹550",
    originalPrice: "₹650",
    discount: 15,
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
    id: "11",
    name: "Butter Chicken",
    description: "Tender chicken in rich tomato-cream sauce with aromatic spices, served with basmati rice.",
    price: "₹320",
    originalPrice: "₹390",
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
    id: "12",
    name: "Chicken Tikka Masala",
    description: "Grilled chicken tikka in creamy tomato-based curry with traditional spices.",
    price: "₹340",
    originalPrice: "₹420",
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
    id: "13",
    name: "Palak Paneer",
    description: "Fresh cottage cheese cubes in spiced spinach gravy, served with naan bread.",
    price: "₹240",
    originalPrice: "₹300",
    discount: 20,
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
    id: "14",
    name: "Chicken Biryani",
    description: "Fragrant basmati rice with tender chicken, saffron, and traditional spices.",
    price: "₹380",
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
    id: "15",
    name: "Dal Makhani",
    description: "Creamy black lentils slow-cooked with butter, cream, and aromatic spices.",
    price: "₹180",
    originalPrice: "₹220",
    image: "https://images.unsplash.com/photo-1559847844-d721426d6924?w=500&h=400&fit=crop",
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
    id: "16",
    name: "Kung Pao Chicken",
    description: "Diced chicken with peanuts, vegetables, and chili peppers in savory sauce.",
    price: "₹280",
    originalPrice: "₹340",
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
    id: "17",
    name: "Sweet and Sour Pork",
    description: "Crispy pork pieces with bell peppers and pineapple in tangy sauce.",
    price: "₹320",
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
    id: "18",
    name: "Beef and Broccoli",
    description: "Tender beef strips with fresh broccoli in classic brown sauce.",
    price: "₹350",
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
    id: "19",
    name: "Vegetable Fried Rice",
    description: "Wok-fried rice with mixed vegetables, egg, and soy sauce.",
    price: "₹180",
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
    id: "20",
    name: "General Tso's Chicken",
    description: "Crispy chicken in sweet and spicy sauce with steamed rice.",
    price: "₹300",
    originalPrice: "₹360",
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
    id: "21",
    name: "Spaghetti Carbonara",
    description: "Classic pasta with eggs, pancetta, parmesan, and black pepper.",
    price: "₹340",
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
    id: "22",
    name: "Chicken Parmigiana",
    description: "Breaded chicken breast with marinara sauce and melted mozzarella.",
    price: "₹420",
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
    id: "23",
    name: "Fettuccine Alfredo",
    description: "Rich and creamy pasta with parmesan cheese and butter sauce.",
    price: "₹320",
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
    id: "24",
    name: "Lasagna Bolognese",
    description: "Layered pasta with meat sauce, bechamel, and three cheeses.",
    price: "₹380",
    originalPrice: "₹460",
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
    id: "25",
    name: "Risotto Mushroom",
    description: "Creamy arborio rice with mixed mushrooms and parmesan cheese.",
    price: "₹360",
    originalPrice: "₹440",
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
    id: "26",
    name: "Chicken Quesadilla",
    description: "Grilled tortilla filled with seasoned chicken, cheese, and peppers.",
    price: "₹260",
    originalPrice: "₹320",
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
    id: "27",
    name: "Beef Tacos (3pc)",
    description: "Soft corn tortillas with seasoned ground beef, lettuce, and cheese.",
    price: "₹220",
    originalPrice: "₹280",
    discount: 21,
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
    id: "28",
    name: "Chicken Burrito Bowl",
    description: "Rice bowl with grilled chicken, beans, salsa, and guacamole.",
    price: "₹290",
    originalPrice: "₹350",
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
    id: "29",
    name: "Veggie Enchiladas",
    description: "Corn tortillas filled with vegetables, topped with cheese and sauce.",
    price: "₹240",
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
    id: "30",
    name: "Carnitas Burrito",
    description: "Large flour tortilla with slow-cooked pork, rice, beans, and salsa.",
    price: "₹310",
    originalPrice: "₹380",
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
    id: "31",
    name: "Salmon Sushi Roll",
    description: "Fresh salmon with rice, wrapped in nori seaweed, served with wasabi and ginger.",
    price: "₹450",
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
    id: "32",
    name: "Chicken Teriyaki Bowl",
    description: "Grilled chicken glazed with teriyaki sauce over steamed rice and vegetables.",
    price: "₹320",
    image: "https://images.unsplash.com/photo-1559847844-d721426d6924?w=500&h=400&fit=crop",
    category: "Japanese",
    rating: 4.7,
    cookTime: "15-18 min",
    isHot: true,
    calories: 420,
    isVegetarian: false,
    spiceLevel: 'mild'
  },
  {
    id: "33",
    name: "Vegetable Tempura",
    description: "Crispy battered and fried seasonal vegetables with tempura dipping sauce.",
    price: "₹280",
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
    id: "34",
    name: "Chicken Ramen",
    description: "Rich broth with tender chicken slices, noodles, egg, and green onions.",
    price: "₹350",
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
    id: "35",
    name: "California Roll",
    description: "Crab, avocado, and cucumber rolled with rice and seaweed.",
    price: "₹380",
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
    id: "36",
    name: "Buffalo Wings",
    description: "Crispy chicken wings tossed in spicy buffalo sauce with celery and blue cheese.",
    price: "₹340",
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
    id: "37",
    name: "Mac and Cheese",
    description: "Creamy macaroni pasta with three-cheese blend and breadcrumb topping.",
    price: "₹220",
    originalPrice: "₹280",
    discount: 21,
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
    id: "38",
    name: "BBQ Ribs",
    description: "Slow-cooked pork ribs with tangy BBQ sauce and coleslaw.",
    price: "₹580",
    originalPrice: "₹720",
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
    id: "39",
    name: "Philly Cheesesteak",
    description: "Sliced steak with melted cheese, peppers, and onions on a hoagie roll.",
    price: "₹380",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&h=400&fit=crop",
    category: "American",
    rating: 4.7,
    cookTime: "12-15 min",
    isHot: true,
    calories: 580,
    isVegetarian: false,
    spiceLevel: 'mild'
  },

  // DESSERTS & SWEETS (30 items)
  {
    id: "91",
    name: "Tiramisu",
    description: "Classic Italian dessert with coffee-soaked ladyfingers and mascarpone.",
    price: "₹180",
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
    id: "92",
    name: "Crème Brûlée",
    description: "French vanilla custard with caramelized sugar crust.",
    price: "₹220",
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
    id: "93",
    name: "Baklava",
    description: "Greek pastry with layers of phyllo, nuts, and honey syrup.",
    price: "₹150",
    originalPrice: "₹180",
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
    id: "94",
    name: "Gulab Jamun (2pc)",
    description: "Traditional Indian milk dumplings soaked in cardamom-flavored syrup.",
    price: "₹89",
    image: "https://images.unsplash.com/photo-1571115332109-9485c0578b05?w=500&h=400&fit=crop",
    category: "Desserts",
    rating: 4.8,
    cookTime: "5-8 min",
    isHot: true,
    calories: 320,
    isVegetarian: true,
    spiceLevel: 'mild'
  },
  {
    id: "95",
    name: "Kulfi (2pc)",
    description: "Traditional Indian ice cream with pistachios and cardamom.",
    price: "₹99",
    image: "https://images.unsplash.com/photo-1590083743904-9e933593b8b3?w=500&h=400&fit=crop",
    category: "Desserts",
    rating: 4.6,
    cookTime: "2-3 min",
    isHot: false,
    calories: 180,
    isVegetarian: true,
    spiceLevel: 'mild'
  },

  // BEVERAGES (25 items)
  {
    id: "96",
    name: "Masala Chai",
    description: "Traditional Indian spiced tea with milk and aromatic spices.",
    price: "₹40",
    originalPrice: "₹50",
    image: "https://images.unsplash.com/photo-1517701550927-2e3a49e5f3b9?w=500&h=400&fit=crop",
    category: "Beverages",
    rating: 4.6,
    cookTime: "3-5 min",
    isHot: true,
    calories: 120,
    isVegetarian: true,
    spiceLevel: 'mild'
  },
  {
    id: "97",
    name: "Fresh Lime Soda",
    description: "Refreshing lime juice with soda water and a hint of mint.",
    price: "₹60",
    originalPrice: "₹80",
    discount: 25,
    image: "https://images.unsplash.com/photo-1517701550927-2e3a49e5f3b9?w=500&h=400&fit=crop",
    category: "Beverages",
    rating: 4.7,
    cookTime: "2-3 min",
    isHot: false,
    calories: 50,
    isVegetarian: true,
    isVegan: true,
    spiceLevel: 'mild'
  },
  {
    id: "98",
    name: "Mango Lassi",
    description: "Creamy yogurt drink blended with fresh mango and cardamom.",
    price: "₹80",
    originalPrice: "₹100",
    image: "https://images.unsplash.com/photo-1517701550927-2e3a49e5f3b9?w=500&h=400&fit=crop",
    category: "Beverages",
    rating: 4.8,
    cookTime: "3-5 min",
    isHot: false,
    calories: 220,
    isVegetarian: true,
    spiceLevel: 'mild'
  },
  {
    id: "99",
    name: "Fresh Coconut Water",
    description: "Natural coconut water served chilled with pulp.",
    price: "₹70",
    originalPrice: "₹90",
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
    id: "100",
    name: "Cold Coffee",
    description: "Chilled coffee with milk, ice cream, and whipped cream.",
    price: "₹120",
    originalPrice: "₹150",
    image: "https://images.unsplash.com/photo-1517701550927-2e3a49e5f3b9?w=500&h=400&fit=crop",
    category: "Beverages",
    rating: 4.5,
    cookTime: "3-5 min",
    isHot: false,
    calories: 180,
    isVegetarian: true,
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