import { create } from 'zustand';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { post, put, del } from '@/lib/api-client';
import type { Cart, CartItem, Product } from '@shared/types';
const CART_ID_KEY = 'verdure-cart-id';
const USER_ID_KEY = 'verdure-user-id';
type CartStore = {
  isCartOpen: boolean;
  orderId: string | null;
  promoCode: string;
  discount: number;
  isAuthenticated: boolean;
  actions: {
    toggleCart: (open?: boolean) => void;
    setOrderId: (orderId: string | null) => void;
    applyPromoCode: (code: string) => void;
    login: (userId: string) => void;
    logout: () => void;
  };
};
const useCartStore = create<CartStore>((set, get) => ({
  isCartOpen: false,
  orderId: null,
  promoCode: '',
  discount: 0,
  isAuthenticated: !!localStorage.getItem(USER_ID_KEY),
  actions: {
    toggleCart: (open) => set((state) => ({ isCartOpen: open !== undefined ? open : !state.isCartOpen })),
    setOrderId: (orderId) => set({ orderId }),
    applyPromoCode: (code) => {
      if (code.toUpperCase() === 'GREEN10') {
        set({ promoCode: code, discount: 0.1 });
        toast.success('Promo code "GREEN10" applied!');
      } else {
        set({ promoCode: '', discount: 0 });
        toast.error('Invalid promo code.');
      }
    },
    login: (userId) => {
      localStorage.setItem(USER_ID_KEY, userId);
      set({ isAuthenticated: true });
    },
    logout: () => {
      localStorage.removeItem(USER_ID_KEY);
      localStorage.removeItem(CART_ID_KEY);
      set({ isAuthenticated: false });
    },
  },
}));
export const useCartUi = () => useCartStore((state) => state);
export const useCartUiActions = () => useCartStore((state) => state.actions);
const getCartId = () => localStorage.getItem(CART_ID_KEY);
const getUserId = () => localStorage.getItem(USER_ID_KEY);
const fetchCart = async (): Promise<Cart> => {
  let cartId = getCartId();
  const userId = getUserId();
  if (userId) {
    cartId = userId; // User's cart ID is their user ID
  }
  const cart = await post<Cart>('/api/cart', { cartId });
  if (cart.id !== getCartId()) {
    localStorage.setItem(CART_ID_KEY, cart.id);
  }
  return cart;
};
export const useCart = () => {
  const isAuthenticated = useCartStore(s => s.isAuthenticated);
  const cartId = getCartId();
  return useQuery<Cart, Error>({
    queryKey: ['cart', cartId, isAuthenticated],
    queryFn: fetchCart,
  });
};
export const useCartMutations = () => {
  const queryClient = useQueryClient();
  const { toggleCart, setOrderId } = useCartUiActions();
  const onMutationSuccess = (updatedCart: Cart) => {
    queryClient.setQueryData(['cart', getCartId(), !!getUserId()], updatedCart);
    queryClient.invalidateQueries({ queryKey: ['cart'] });
    queryClient.invalidateQueries({ queryKey: ['products'] });
  };
  const addToCartMutation = useMutation({
    mutationFn: ({ product, variantSku, quantity }: { product: Product, variantSku: string, quantity: number }) => {
      const variant = product.variants.find(v => v.sku === variantSku);
      if (!variant) throw new Error("Variant not found");
      if (variant.inventory <= 0) throw new Error("Out of stock");
      let cartId = getCartId();
      const userId = getUserId();
      if (userId) cartId = userId;
      if (!cartId) throw new Error("Cart not initialized");
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
    onError: (error: Error) => {
      if (error.message === 'Out of stock') {
        toast.error("Item is out of stock.");
      } else {
        toast.error("Failed to add item to cart.");
      }
    },
  });
  const updateQuantityMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string, quantity: number }) => {
      let cartId = getCartId();
      const userId = getUserId();
      if (userId) cartId = userId;
      if (!cartId) throw new Error("Cart not initialized");
      return put<Cart>(`/api/cart/${cartId}/items/${itemId}`, { quantity });
    },
    onSuccess: onMutationSuccess,
    onError: () => toast.error("Failed to update item quantity."),
  });
  const removeFromCartMutation = useMutation({
    mutationFn: (itemId: string) => {
      let cartId = getCartId();
      const userId = getUserId();
      if (userId) cartId = userId;
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
    mutationFn: ({ guestInfo }: { guestInfo?: { name: string; email: string } } = {}) => {
      const userId = getUserId();
      let cartId = getCartId();
      if (userId) cartId = userId;
      if (!cartId) throw new Error("Cart not initialized");
      if (!userId && !guestInfo) throw new Error("Guest details are required for checkout.");
      const payload = {
        cartId,
        userId: userId || null,
        ...guestInfo,
      };
      return post<{ orderId: string }>(`/api/checkout`, payload);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toggleCart(false);
      setOrderId(data.orderId);
    },
    onError: (error: Error) => toast.error(`Checkout failed: ${error.message}`),
  });
  return {
    addToCart: addToCartMutation.mutate,
    updateQuantity: updateQuantityMutation.mutate,
    removeFromCart: removeFromCartMutation.mutate,
    checkout: checkoutMutation.mutate,
    isCheckingOut: checkoutMutation.isPending,
  };
};
export const useCartActions = () => {
  const uiActions = useCartUiActions();
  const mutations = useCartMutations();
  const isAuthenticated = useCartStore(s => s.isAuthenticated);
  return { ...uiActions, ...mutations, isAuthenticated };
};