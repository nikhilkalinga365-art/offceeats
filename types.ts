
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  calories: number;
  timeEstimate: string; // e.g., "15 min"
  imageUrl: string;
  category: string;
  isPopular?: boolean;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export enum CategoryType {
  ALL = 'All',
  BURGER = 'Burger',
  PIZZA = 'Pizza',
  COFFEE = 'Coffee',
  ASIAN = 'Asian',
  HEALTHY = 'Healthy',
  DESSERT = 'Dessert'
}

export interface PromoOffer {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  startDate: Date;
  expiryDate: Date;
  discountPercentage: number; // e.g. 20 for 20%
  // Dynamic Pricing Options
  enableDynamicPricing?: boolean;
  priceIncreaseInterval?: number; // Minutes
  priceIncreaseStep?: number; // Percentage points to reduce discount by
}

export interface User {
  id: string;
  name: string;
  phoneNumber: string;
  avatarUrl?: string;
}

export interface Order {
  id: string;
  date: Date;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: 'Completed' | 'Processing' | 'Cancelled';
  deliveryMethod: 'desk' | 'pickup';
  seatNumber?: string;
  mobileNumber: string;
}

export interface RestaurantSettings {
  isStoreOpen: boolean;
  isDeskDeliveryEnabled: boolean;
  deliveryStartHour: number; // 0-23
  deliveryEndHour: number; // 0-23
  supportContact: string;
  stallNumber: string;
}
