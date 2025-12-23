import { CategoryType, MenuItem, PromoOffer } from './types';

export const CATEGORIES = [
  { id: CategoryType.BURGER, name: 'Burger', icon: '🍔' },
  { id: CategoryType.PIZZA, name: 'Pizza', icon: '🍕' },
  { id: CategoryType.COFFEE, name: 'Coffee', icon: '☕' },
  { id: CategoryType.ASIAN, name: 'Rice', icon: '🍚' },
  { id: CategoryType.HEALTHY, name: 'Salad', icon: '🥗' },
  { id: CategoryType.DESSERT, name: 'Sweet', icon: '🍩' },
];

export const MENU_ITEMS: MenuItem[] = [
  {
    id: '1',
    name: 'Truffle Macchiato',
    description: 'Rich espresso with truffle foam and caramel drizzle.',
    price: 12.25,
    rating: 4.5,
    calories: 240,
    timeEstimate: '5 min',
    imageUrl: 'https://picsum.photos/400/400?random=1',
    category: CategoryType.COFFEE,
    isPopular: true,
  },
  {
    id: '2',
    name: 'Flat White Deluxe',
    description: 'Smooth microfoam over a double shot of espresso.',
    price: 8.50,
    rating: 4.7,
    calories: 180,
    timeEstimate: '4 min',
    imageUrl: 'https://picsum.photos/400/400?random=2',
    category: CategoryType.COFFEE,
  },
  {
    id: '3',
    name: 'Double Cheeseburger',
    description: 'Two beef patties, cheddar, pickles, and house sauce.',
    price: 15.99,
    rating: 4.8,
    calories: 850,
    timeEstimate: '20 min',
    imageUrl: 'https://picsum.photos/400/400?random=3',
    category: CategoryType.BURGER,
  },
  {
    id: '4',
    name: 'Spicy Basil Chicken',
    description: 'Thai style minced chicken with basil and fried egg.',
    price: 13.50,
    rating: 4.6,
    calories: 550,
    timeEstimate: '15 min',
    imageUrl: 'https://picsum.photos/400/400?random=4',
    category: CategoryType.ASIAN,
  },
  {
    id: '5',
    name: 'Margherita Pizza',
    description: 'Classic tomato, mozzarella, and basil.',
    price: 11.00,
    rating: 4.3,
    calories: 700,
    timeEstimate: '25 min',
    imageUrl: 'https://picsum.photos/400/400?random=5',
    category: CategoryType.PIZZA,
  },
  {
    id: '6',
    name: 'Quinoa Power Bowl',
    description: 'Quinoa, avocado, chickpeas, and lemon dressing.',
    price: 14.25,
    rating: 4.9,
    calories: 320,
    timeEstimate: '10 min',
    imageUrl: 'https://picsum.photos/400/400?random=6',
    category: CategoryType.HEALTHY,
  },
];

// Set a promo expiry 2 hours from now for demonstration
const now = new Date();
export const ACTIVE_PROMO: PromoOffer = {
  id: 'promo-1',
  title: 'Happy Hour Special',
  subtitle: 'Get 20% off all orders',
  discountPercentage: 20,
  image: 'https://picsum.photos/800/400?random=10',
  startDate: now,
  expiryDate: new Date(now.getTime() + 2 * 60 * 60 * 1000), // 2 hours from now
};