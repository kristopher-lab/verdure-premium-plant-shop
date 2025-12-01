import { create } from 'zustand';
import { toast } from 'sonner';
import { get, post, put, del } from '@/lib/api-client';
import type { Cart, CartItem, Product } from '@shared/types';
const CART_ID_KEY = 'verdure-cart-id';
type CartState = {
  cart: Cart | null;
  cartId: string | null;
  isLoading: boolean;
  isCartOpen: boolean;
  actions: {
    initCart: () => Promise<void>;
    addToCart: (product: Product, variantSku: string, quantity: number) => Promise<void>;
    updateQuantity: (itemId: string, quantity: number) => Promise<void>;
    removeFromCart: (itemId: string) => Promise<void>;
    clearCart: () => Promise<void>;
    checkout: () => Promise<void>;
    toggleCart: (open?: boolean) => void;
  };
};
const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  cartId: localStorage.getItem(CART_ID_KEY),
  isLoading: true,
  isCartOpen: false,
  actions: {
    toggleCart: (open) => set((state) => ({ isCartOpen: open !== undefined ? open : !state.isCartOpen })),
    initCart: async () => {
      set({ isLoading: true });
      try {
        const cartId = get().cartId;
        const cart = await post<Cart>('/api/cart', { cartId });
        if (cart.id !== cartId) {
          localStorage.setItem(CART_ID_KEY, cart.id);
        }
        set({ cart, cartId: cart.id, isLoading: false });
      } catch (error) {
        console.error("Failed to initialize cart:", error);
        toast.error("Could not connect to your cart.");
        // Fallback to a local cart if API fails
        const localCartId = get().cartId || `local_${crypto.randomUUID()}`;
        set({
          cart: { id: localCartId, items: [], subtotal: 0, createdAt: Date.now(), updatedAt: Date.now() },
          cartId: localCartId,
          isLoading: false,
        });
        if (!get().cartId) localStorage.setItem(CART_ID_KEY, localCartId);
      }
    },
    addToCart: async (product, variantSku, quantity) => {
      const { cartId, cart } = get();
      if (!cartId || !cart) return;
      const variant = product.variants.find(v => v.sku === variantSku);
      if (!variant) {
        toast.error("Selected product variant not found.");
        return;
      }
      const cartItem: Omit<CartItem, 'id'> = {
        productId: product.id,
        name: product.name,
        image: product.images[0],
        price: variant.price,
        quantity,
        variantName: variant.name,
      };
      toast.success(`${product.name} added to cart!`);
      set({ isCartOpen: true });
      try {
        const updatedCart = await post<Cart>(`/api/cart/${cartId}/items`, cartItem);
        set({ cart: updatedCart });
      } catch (error) {
        console.error("Failed to add item:", error);
        toast.error("Failed to add item to cart.");
      }
    },
    updateQuantity: async (itemId, quantity) => {
      const { cartId } = get();
      if (!cartId) return;
      try {
        const updatedCart = await put<Cart>(`/api/cart/${cartId}/items/${itemId}`, { quantity });
        set({ cart: updatedCart });
      } catch (error) {
        console.error("Failed to update quantity:", error);
        toast.error("Failed to update item quantity.");
      }
    },
    removeFromCart: async (itemId) => {
      const { cartId } = get();
      if (!cartId) return;
      try {
        const updatedCart = await del<Cart>(`/api/cart/${cartId}/items/${itemId}`);
        set({ cart: updatedCart });
        toast.info("Item removed from cart.");
      } catch (error) {
        console.error("Failed to remove item:", error);
        toast.error("Failed to remove item from cart.");
      }
    },
    clearCart: async () => {
      // This is handled by checkout for now
    },
    checkout: async () => {
      const { cartId } = get();
      if (!cartId) return;
      try {
        await post('/api/checkout', { cartId });
        set(state => ({
          cart: { ...state.cart!, items: [], subtotal: 0 },
          isCartOpen: false,
        }));
        toast.success("Checkout successful!", { description: "Your order has been placed." });
      } catch (error) {
        console.error("Checkout failed:", error);
        toast.error("Checkout failed. Please try again.");
      }
    },
  },
}));
export const useCart = () => useCartStore((state) => state);
export const useCartActions = () => useCartStore((state) => state.actions);