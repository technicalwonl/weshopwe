export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price?: number | null;
  originalPrice?: number;
  discount?: number | null;
  images: string[] | null;
  category: string;
  category_id?: string | null;
  rating: number | null;
  reviews: number | null;
  stock: number | null;
  featured?: boolean | null;
  trending?: boolean | null;
  is_active?: boolean | null;
  created_at?: string;
  updated_at?: string;
  createdAt?: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  productCount?: number;
  created_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  customerInfo: CustomerInfo;
  status: OrderStatus;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerInfo {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export type OrderStatus = 'placed' | 'packed' | 'shipped' | 'delivered' | 'cancelled';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin';
  addresses: CustomerInfo[];
  orders: string[];
}

export interface AdminStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalUsers: number;
}
