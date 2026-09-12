/**
 * Cafe Menu Data
 * Clean structured data prepared for AR 3D model integration
 */

const MENU_CATEGORIES = [
  { id: 'all', label: 'All Items', icon: '☕' },
  { id: 'hot-coffee', label: 'Hot Coffee', icon: '🔥' },
  { id: 'cold-coffee', label: 'Cold Coffee', icon: '❄️' },
  { id: 'frapelicious', label: 'Frapelicious', icon: '🥤' },
  { id: 'add-ons', label: 'Add-Ons', icon: '✨' }
];

const MENU_ITEMS = [
  // ================= HOT COFFEE =================
  {
    id: 'espresso',
    name: 'Espresso',
    price: 68,
    category: 'Hot Coffee',
    categorySlug: 'hot-coffee',
    description: 'A Classic Italian Coffee Shot',
    image: 'images/espresso.webp',
    model: 'models/espresso.glb',
    badge: 'Classic Shot'
  },
  {
    id: 'american-kick',
    name: 'American Kick',
    price: 79,
    category: 'Hot Coffee',
    categorySlug: 'hot-coffee',
    description: 'Mild American Style Coffee',
    image: 'images/american-kick.webp',
    model: 'models/american-kick.glb',
    badge: 'Popular'
  },
  {
    id: 'old-style-latte',
    name: '"Old Style" Latte',
    price: 98,
    category: 'Hot Coffee',
    categorySlug: 'hot-coffee',
    description: 'A Steamed Milk with Mellowed Espresso and Froth',
    image: 'images/old-style-latte.webp',
    model: 'models/old-style-latte.glb',
    badge: ''
  },
  {
    id: 'cappuccino',
    name: 'Cappuccino',
    price: 108,
    category: 'Hot Coffee',
    categorySlug: 'hot-coffee',
    description: 'Classic Italian Coffee Shot with Steamed & Foamed Milk',
    image: 'images/cappuccino.webp',
    model: 'models/cappuccino.glb',
    badge: 'Best Seller'
  },
  {
    id: 'mocha-latte',
    name: 'Mocha Latte',
    price: 118,
    category: 'Hot Coffee',
    categorySlug: 'hot-coffee',
    description: 'Chocolaty Taste with Steamed Milk Over Italian Shot',
    image: 'images/mocha-latte.webp',
    model: 'models/mocha-latte.glb',
    badge: ''
  },
  {
    id: 'irish-coffee',
    name: 'Irish Coffee',
    price: 108,
    category: 'Hot Coffee',
    categorySlug: 'hot-coffee',
    description: 'A Smooth Non-Alcoholic Whiskey Flavoured Coffee',
    image: 'images/irish-coffee.webp',
    model: 'models/irish-coffee.glb',
    badge: 'Specialty'
  },
  {
    id: 'caramel-cappuccino',
    name: 'Caramel Cappuccino',
    price: 118,
    category: 'Hot Coffee',
    categorySlug: 'hot-coffee',
    description: 'A Sweet Caramel Flavour Mixed In Cappuccino',
    image: 'images/caramel-cappuccino.webp',
    model: 'models/caramel-cappuccino.glb',
    badge: ''
  },
  {
    id: 'french-vanilla-cappuccino',
    name: 'French Vanilla Cappuccino',
    price: 118,
    category: 'Hot Coffee',
    categorySlug: 'hot-coffee',
    description: 'Classic Cappuccino Pour Over Mild Vanilla Flavour',
    image: 'images/french-vanilla-cappuccino.webp',
    model: 'models/french-vanilla-cappuccino.glb',
    badge: ''
  },
  {
    id: 'hazelnut-cappuccino',
    name: 'Hazelnut Cappuccino',
    price: 118,
    category: 'Hot Coffee',
    categorySlug: 'hot-coffee',
    description: 'Flavor That Makes You Fall In Love With Cappuccino',
    image: 'images/hazelnut-cappuccino.webp',
    model: 'models/hazelnut-cappuccino.glb',
    badge: 'Favorite'
  },
  {
    id: 'vanilla-creamy-mocha',
    name: 'Vanilla Creamy Mocha',
    price: 98,
    category: 'Hot Coffee',
    categorySlug: 'hot-coffee',
    description: 'Mix of Vanilla & Chocolate with Creaminess',
    image: 'images/vanilla-creamy-mocha.webp',
    model: 'models/vanilla-creamy-mocha.glb',
    badge: ''
  },

  // ================= COLD COFFEE =================
  {
    id: 'iced-americano',
    name: 'Iced Americano',
    price: 98,
    category: 'Cold Coffee',
    categorySlug: 'cold-coffee',
    description: 'An Traditional American Coffee Chilled And Sweeten Upto The Taste',
    image: 'images/iced-americano.webp',
    model: 'models/iced-americano.glb',
    badge: 'Signature Cold'
  },
  {
    id: 'caramel-iced-cappuccino',
    name: 'Caramel Iced Cappuccino',
    price: 118,
    category: 'Cold Coffee',
    categorySlug: 'cold-coffee',
    description: 'Sweet & Cold Caramelized Cappuccino',
    image: 'images/caramel-iced-cappuccino.webp',
    model: 'models/caramel-iced-cappuccino.glb',
    badge: ''
  },
  {
    id: 'irish-iced-coffee',
    name: 'Irish Iced Coffee',
    price: 118,
    category: 'Cold Coffee',
    categorySlug: 'cold-coffee',
    description: 'The Coffee You Love Now Has Irish Touch',
    image: 'images/irish-iced-coffee.webp',
    model: 'models/irish-iced-coffee.glb',
    badge: 'Specialty'
  },
  {
    id: 'iced-choco-mojito',
    name: 'Iced Choco Mojito',
    price: 148,
    category: 'Cold Coffee',
    categorySlug: 'cold-coffee',
    description: 'Sweet Chocolaty & Minty Flavour Latte',
    image: 'images/iced-choco-mojito.webp',
    model: 'models/iced-choco-mojito.glb',
    badge: 'Signature'
  },
  {
    id: 'iced-coconut-swirl-latte',
    name: 'Iced Coconut Swirl Latte',
    price: 138,
    category: 'Cold Coffee',
    categorySlug: 'cold-coffee',
    description: 'Sweet Coconut Blended In Latte To Give You Extra Creamy Flavor',
    image: 'images/iced-coconut-swirl-latte.webp',
    model: 'models/iced-coconut-swirl-latte.glb',
    badge: 'Tropical'
  },

  // ================= FRAPELICIOUS =================
  {
    id: 'frape-original',
    name: 'Original',
    price: 119,
    category: 'Frapelicious',
    categorySlug: 'frapelicious',
    description: 'Classic ice blended rich coffee frappe',
    image: 'images/frape-original.webp',
    model: 'models/frape-original.glb',
    badge: 'Classic'
  },
  {
    id: 'double-choco-chips',
    name: 'Double Choco Chips',
    price: 164,
    category: 'Frapelicious',
    categorySlug: 'frapelicious',
    description: 'Blended with rich chocolate and crunchy choco chips',
    image: 'images/double-choco-chips.webp',
    model: 'models/double-choco-chips.glb',
    badge: 'Top Pick'
  },
  {
    id: 'cookie-dough',
    name: 'Cookie Dough',
    price: 159,
    category: 'Frapelicious',
    categorySlug: 'frapelicious',
    description: 'Indulgent frappe loaded with decadent cookie dough flavour',
    image: 'images/cookie-dough.webp',
    model: 'models/cookie-dough.glb',
    badge: ''
  },
  {
    id: 'black-forest',
    name: 'Black Forest',
    price: 164,
    category: 'Frapelicious',
    categorySlug: 'frapelicious',
    description: 'Rich dark chocolate and cherry infused blended delight',
    image: 'images/black-forest.webp',
    model: 'models/black-forest.glb',
    badge: ''
  },
  {
    id: 'crazy-frape',
    name: 'Crazy Frape',
    price: 178,
    category: 'Frapelicious',
    categorySlug: 'frapelicious',
    description: "Chef's special decadent cold blended treat",
    image: 'images/crazy-frape.webp',
    model: 'models/crazy-frape.glb',
    badge: 'Chef Special'
  },
  {
    id: 'dark-knight-mocha',
    name: 'Dark Knight Mocha',
    price: 168,
    category: 'Frapelicious',
    categorySlug: 'frapelicious',
    description: 'Deep roasted dark cocoa blended with bold espresso',
    image: 'images/dark-knight-mocha.webp',
    model: 'models/dark-knight-mocha.glb',
    badge: 'Bold'
  },
  {
    id: 'frozen-vanilla',
    name: 'Frozen Vanilla',
    price: 164,
    category: 'Frapelicious',
    categorySlug: 'frapelicious',
    description: 'Chilled vanilla cream blended delight',
    image: 'images/frozen-vanilla.webp',
    model: 'models/frozen-vanilla.glb',
    badge: 'Non Coffee',
    isNonCoffee: true
  },
  {
    id: 'java-choco-chip',
    name: 'Java Choco Chip',
    price: 124,
    category: 'Frapelicious',
    categorySlug: 'frapelicious',
    description: 'Creamy choco chip fusion without coffee',
    image: 'images/java-choco-chip.webp',
    model: 'models/java-choco-chip.glb',
    badge: 'Non Coffee',
    isNonCoffee: true
  },

  // ================= ADD-ONS =================
  {
    id: 'whipped-cream',
    name: 'Whipped Cream',
    price: 38,
    category: 'Add-Ons',
    categorySlug: 'add-ons',
    description: 'Top up with silky whipped cream (when you purchase coffee)',
    image: 'images/whipped-cream.webp',
    model: 'models/whipped-cream.glb',
    badge: 'Add-On'
  },
  {
    id: 'donut',
    name: 'Donut',
    price: 38,
    category: 'Add-Ons',
    categorySlug: 'add-ons',
    description: 'Fresh artisanal glazed donut (when you purchase coffee)',
    image: 'images/donut.webp',
    model: 'models/donut.glb',
    badge: 'Add-On'
  }
];

if (typeof window !== 'undefined') {
  window.MENU_CATEGORIES = MENU_CATEGORIES;
  window.MENU_ITEMS = MENU_ITEMS;
}
