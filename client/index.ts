import { User, Product, Shop, Order, OrderItem, Review, Message, CartItem, WishlistItem } from "@shared/schema";

export type ProductWithShop = Product & {
  shop?: Shop;
};

export type OrderWithItems = Order & {
  items: OrderItem[];
  products?: Product[];
};

export type ProductWithReviews = Product & {
  reviews?: Review[];
  shop?: Shop;
};

export type SortOption = 'newest' | 'price_low' | 'price_high' | 'popular';

export type ProductFilterOptions = {
  category?: string;
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: SortOption;
};

export type PeriodOption = 'day' | 'week' | 'month' | 'year';

export type AnalyticsData = {
  period: string;
  sales: number;
  revenue: number;
};

export type TopProduct = {
  id: number;
  title: string;
  sales: number;
  revenue: number;
};

export type ShippingAddress = {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
};

export type MessageThread = {
  userId: number;
  username: string;
  lastMessage: Message;
};

export type ChatMessage = Message & {
  status?: 'sent' | 'delivered' | 'read';
};
