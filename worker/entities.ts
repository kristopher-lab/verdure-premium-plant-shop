import { IndexedEntity } from "./core-utils";
import type { Product, Cart, CartItem, Order, User } from "@shared/types";
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
    userId: null,
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
  static seedData = [
    { id: 'ord_001', cartId: 'cart1', items: [{ id: 'MD-S-01', productId: 'prod_01', name: 'Monstera Deliciosa', image: '', price: 3500, quantity: 1 }], total: 3500, customer: {name: 'John Doe', email: 'j@example.com'}, createdAt: Date.now() - 86400000*65 },
    { id: 'ord_002', cartId: 'cart2', items: [{ id: 'SP-S-02', productId: 'prod_02', name: 'Snake Plant', image: '', price: 2800, quantity: 2 }], total: 5600, customer: {name: 'Jane Smith', email: 'jane@example.com'}, createdAt: Date.now() - 86400000*50 },
    { id: 'ord_003', cartId: 'cart3', items: [{ id: 'FLF-M-03', productId: 'prod_03', name: 'Fiddle Leaf Fig', image: '', price: 7500, quantity: 1 }], total: 7500, customer: {name: 'Peter Jones', email: 'peter@example.com'}, createdAt: Date.now() - 86400000*40 },
    { id: 'ord_004', cartId: 'cart4', items: [{ id: 'ECH-S-04', productId: 'prod_04', name: 'Echeveria "Lola"', image: '', price: 1200, quantity: 3 }], total: 3600, customer: {name: 'Mary Williams', email: 'mary@example.com'}, createdAt: Date.now() - 86400000*25 },
    { id: 'ord_005', cartId: 'cart5', items: [{ id: 'PQ-M-05', productId: 'prod_05', name: 'Pothos "Marble Queen"', image: '', price: 2200, quantity: 1 }], total: 2200, customer: {name: 'David Brown', email: 'd@example.com'}, createdAt: Date.now() - 86400000*10 },
    { id: 'ord_006', cartId: 'cart6', items: [{ id: 'BOP-L-06', productId: 'prod_06', name: 'Bird of Paradise', image: '', price: 8500, quantity: 1 }], total: 8500, customer: {name: 'John Doe', email: 'j@example.com'}, createdAt: Date.now() - 86400000*5 },
  ];
}
// USER ENTITY
export class UserEntity extends IndexedEntity<User> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: User = {
    id: "",
    email: "",
    name: "",
    createdAt: 0,
  };
  static seedData = [
    { id: "user_1", email: "test@example.com", name: "Test User", createdAt: Date.now() }
  ];
}