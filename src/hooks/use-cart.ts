import { create } from 'zustand';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, put, del } from '@/lib/api-client';
import type { Cart, CartItem, Product } from '@shared/types';
const CART_ID_KEY = 'verdure-cart-id';
type CartStore = {
  isCartOpen: boolean;
  orderId: string | null;
  actions: {
    toggleCart: (open?: boolean) => void;
    setOrderId: (orderId: string | null) => void;
  };
};
const useCartStore = create<CartStore>((set) => ({
  isCartOpen: false,
  orderId: null,
  actions: {
    toggleCart: (open) => set((state) => ({ isCartOpen: open !== undefined ? open : !state.isCartOpen })),
    setOrderId: (orderId) => set({ orderId }),
  },
}));
export const useCartUi = () => useCartStore((state) => state);
export const useCartUiActions = () => useCartStore((state) => state.actions);
const getCartId = () => localStorage.getItem(CART_ID_KEY);
const fetchCart = async (): Promise<Cart> => {
  const cartId = getCartId();
  const cart = await post<Cart>('/api/cart', { cartId });
  if (cart.id !== cartId) {
    localStorage.setItem(CART_ID_KEY, cart.id);
  }
  return cart;
};
export const useCart = () => {
  return useQuery<Cart, Error>({
    queryKey: ['cart', getCartId()],
    queryFn: fetchCart,
  });
};
export const useCartMutations = () => {
  const queryClient = useQueryClient();
  const { toggleCart, setOrderId } = useCartUiActions();
  const onMutationSuccess = (updatedCart: Cart) => {
    queryClient.setQueryData(['cart', updatedCart.id], updatedCart);
  };
  const addToCartMutation = useMutation({
    mutationFn: ({ product, variantSku, quantity }: { product: Product, variantSku: string, quantity: number }) => {
      const cartId = getCartId();
      if (!cartId) throw new Error("Cart not initialized");
      const variant = product.variants.find(v => v.sku === variantSku);
      if (!variant) throw new Error("Variant not found");
      const cartItem: Omit<CartItem, 'id'> = {
        productId: product.id, name: product.name, image: product.images[0],
        price: variant.price, quantity, variantName: variant.name,
      };
      return post<Cart>(`/api/cart/${cartId}/items`, cartItem);
    },
    onSuccess: (updatedCart) => {
      onMutationSuccess(updatedCart);
      toast.success(`${updatedCart.items[updatedCart.items.length - 1].name} added to cart!`);
      toggleCart(true);
    },
    onError: () => toast.error("Failed to add item to cart."),
  });
  const updateQuantityMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string, quantity: number }) => {
      const cartId = getCartId();
      if (!cartId) throw new Error("Cart not initialized");
      return put<Cart>(`/api/cart/${cartId}/items/${itemId}`, { quantity });
    },
    onSuccess: onMutationSuccess,
    onError: () => toast.error("Failed to update item quantity."),
  });
  const removeFromCartMutation = useMutation({
    mutationFn: (itemId: string) => {
      const cartId = getCartId();
      if (!cartId) throw new Error("Cart not initialized");
      return del<Cart>(`/api/cart/${cartId}/items/${itemId}`);
    },
    onSuccess: (updatedCart) => {
      onMutationSuccess(updatedCart);
      toast.info("Item removed from cart.");
    },
    onError: () => toast.error("Failed to remove item from cart."),
  });
  const checkoutMutation = useMutation({
    mutationFn: () => {
      const cartId = getCartId();
      if (!cartId) throw new Error("Cart not initialized");
      return post<{ orderId: string }>(`/api/checkout`, { cartId });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cart', getCartId()] });
      toggleCart(false);
      setOrderId(data.orderId);
    },
    onError: () => toast.error("Checkout failed. Please try again."),
  });
  return {
    addToCart: addToCartMutation.mutate,
    updateQuantity: updateQuantityMutation.mutate,
    removeFromCart: removeFromCartMutation.mutate,
    checkout: checkoutMutation.mutate,
  };
};