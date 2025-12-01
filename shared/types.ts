export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}
export type ProductVariant = {
  id: string;
  name: string; // e.g., "Small", "Medium", "Large"
  sku: string;
  price: number; // in cents
  inventory: number;
};
export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number; // in cents, for the default variant
  images: string[];
  category: 'Indoor' | 'Outdoor' | 'Succulents' | 'Cacti';
  tags: ('Full Sun' | 'Partial Shade' | 'Low Light' | 'Pet-Friendly' | 'Air Purifying')[];
  variants: ProductVariant[];
};
export type CartItem = {
  id: string; // This will be the variant SKU
  productId: string;
  name: string;
  image: string;
  price: number; // in cents
  quantity: number;
  variantName?: string;
};
export type Cart = {
  id: string;
  userId?: string | null;
  items: CartItem[];
  subtotal: number; // in cents
  createdAt: number;
  updatedAt: number;
};
export type Order = {
  id: string;
  cartId: string;
  items: CartItem[];
  total: number; // in cents
  customer: {
    name: string;
    email: string;
  };
  createdAt: number;
};
export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: number;
}
export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}
// Keep original demo types for compatibility if needed, can be removed later
export interface Chat {
  id: string;
  title: string;
}
export interface ChatMessage {
  id: string;
  chatId: string;
  userId: string;
  text: string;
  ts: number; // epoch millis
}