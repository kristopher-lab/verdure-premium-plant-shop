import { IndexedEntity } from "./core-utils";
import type { Product, Cart, CartItem, Order } from "@shared/types";
import { MOCK_PRODUCTS } from "@shared/mock-data";
// PRODUCT ENTITY
export class ProductEntity extends IndexedEntity<Product> {
  static readonly entityName = "product";
  static readonly indexName = "products";
  static readonly initialState: Product = {
    id: "",
    name: "",
    slug: "",
    description: "",
    price: 0,
    images: [],
    category: "Indoor",
    tags: [],
    variants: [],
  };
  static seedData = MOCK_PRODUCTS;
}
// CART ENTITY
export class CartEntity extends IndexedEntity<Cart> {
  static readonly entityName = "cart";
  static readonly indexName = "carts";
  static readonly initialState: Cart = {
    id: "",
    items: [],
    subtotal: 0,
    createdAt: 0,
    updatedAt: 0,
  };
  private recalculateSubtotal(items: CartItem[]): number {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  }
  async addItem(item: Omit<CartItem, 'id'>): Promise<Cart> {
    return this.mutate(cart => {
      const existingItem = cart.items.find(i => i.productId === item.productId && i.variantName === item.variantName);
      let newItems: CartItem[];
      if (existingItem) {
        newItems = cart.items.map(i =>
          i.productId === item.productId && i.variantName === item.variantName
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      } else {
        const newItem: CartItem = {
          ...item,
          id: item.variantName ? `${item.productId}-${item.variantName}` : item.productId,
        };
        newItems = [...cart.items, newItem];
      }
      return {
        ...cart,
        items: newItems,
        subtotal: this.recalculateSubtotal(newItems),
        updatedAt: Date.now(),
      };
    });
  }
  async updateItemQuantity(itemId: string, quantity: number): Promise<Cart> {
    return this.mutate(cart => {
      let newItems: CartItem[];
      if (quantity <= 0) {
        newItems = cart.items.filter(i => i.id !== itemId);
      } else {
        newItems = cart.items.map(i =>
          i.id === itemId ? { ...i, quantity } : i
        );
      }
      return {
        ...cart,
        items: newItems,
        subtotal: this.recalculateSubtotal(newItems),
        updatedAt: Date.now(),
      };
    });
  }
  async removeItem(itemId: string): Promise<Cart> {
    return this.mutate(cart => {
      const newItems = cart.items.filter(i => i.id !== itemId);
      return {
        ...cart,
        items: newItems,
        subtotal: this.recalculateSubtotal(newItems),
        updatedAt: Date.now(),
      };
    });
  }
  async clear(): Promise<Cart> {
    return this.mutate(cart => ({
      ...cart,
      items: [],
      subtotal: 0,
      updatedAt: Date.now(),
    }));
  }
}
// ORDER ENTITY
export class OrderEntity extends IndexedEntity<Order> {
  static readonly entityName = "order";
  static readonly indexName = "orders";
  static readonly initialState: Order = {
    id: "",
    cartId: "",
    items: [],
    total: 0,
    customer: { name: "Guest", email: "guest@example.com" },
    createdAt: 0,
  };
}