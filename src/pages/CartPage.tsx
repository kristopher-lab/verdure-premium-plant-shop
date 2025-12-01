import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Trash2, Leaf, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Toaster, toast } from 'sonner';
import { useCart, useCartActions, useCartUi } from '@/hooks/use-cart';
import type { CartItem } from '@shared/types';
import { GuestCheckoutModal } from '@/components/GuestCheckoutModal';
import { ThemeToggle } from '@/components/ThemeToggle';
import { OrderConfirmation } from '@/components/OrderConfirmation';
import { Skeleton } from '@/components/ui/skeleton';
const formatPrice = (price: number) => `${(price / 100).toFixed(2)}`;
function CartItemView({ item }: { item: CartItem }) {
  const { updateQuantity, removeFromCart } = useCartActions();
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="flex items-start gap-4 py-4"
    >
      <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-md border" loading="lazy" />
      <div className="flex-grow">
        <h3 className="font-semibold text-lg">{item.name}</h3>
        <p className="text-sm text-muted-foreground">{item.variantName}</p>
        <p className="text-md font-medium mt-1">{formatPrice(item.price)}</p>
        <div className="flex items-center border rounded-md w-fit mt-2">
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity({ itemId: item.id, quantity: item.quantity - 1 })} aria-label={`Decrease quantity of ${item.name}`}>-</Button>
          </motion.div>
          <span className="w-8 text-center text-sm font-semibold" aria-live="polite">{item.quantity}</span>
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity({ itemId: item.id, quantity: item.quantity + 1 })} aria-label={`Increase quantity of ${item.name}`}>+</Button>
          </motion.div>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold text-lg">{formatPrice(item.price * item.quantity)}</p>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive mt-2" onClick={() => removeFromCart(item.id)} aria-label={`Remove ${item.name} from cart`}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}
export default function CartPage() {
  const { data: cart, isLoading } = useCart();
  const { discount, promoCode, orderId } = useCartUi();
  const { applyPromoCode, checkout, isAuthenticated, isCheckingOut, setOrderId } = useCartActions();
  const [promoInput, setPromoInput] = useState('');
  const [showGuestModal, setShowGuestModal] = useState(false);
  const itemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const subtotal = cart?.subtotal ?? 0;
  const total = subtotal * (1 - discount);
  const handleCheckout = () => {
    if (!cart || cart.items.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }
    if (isAuthenticated) {
      checkout();
    } else {
      setShowGuestModal(true);
    }
  };
  const handleGuestCheckout = (guestInfo: { name: string; email: string }) => {
    setShowGuestModal(false);
    checkout({ guestInfo });
  };
  return (
    <div className="bg-background min-h-screen">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" role="navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold font-display text-primary">Verdure</h1>
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost"><Link to="/"><ChevronLeft className="h-4 w-4 mr-2" /> Continue Shopping</Link></Button>
            <ThemeToggle className="relative top-0 right-0" />
          </div>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8 md:py-10 lg:py-12">
            <h1 className="text-4xl font-bold font-display mb-8">Your Cart</h1>
            {isLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <Card className="lg:col-span-2 space-y-4 p-6">
                  <Skeleton className="h-24 w-full animate-shimmer" />
                  <Skeleton className="h-24 w-full animate-shimmer" />
                  <Skeleton className="h-24 w-full animate-shimmer" />
                </Card>
                <Card className="sticky top-24 p-6 space-y-4">
                  <Skeleton className="h-8 w-1/2 animate-shimmer" />
                  <Skeleton className="h-10 w-full animate-shimmer" />
                  <Skeleton className="h-20 w-full animate-shimmer" />
                  <Skeleton className="h-12 w-full animate-shimmer" />
                </Card>
              </div>
            ) : !cart || cart.items.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <ShoppingCart className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-xl font-semibold">Your cart is empty</p>
                <p className="text-muted-foreground mt-2">Looks like you haven't added any plants yet.</p>
                <Button asChild className="mt-6">
                  <Link to="/">Explore Plants</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Cart Items ({itemCount})</CardTitle>
                  </CardHeader>
                  <CardContent className="divide-y">
                    <AnimatePresence>
                      {cart.items.map(item => (
                        <CartItemView key={item.id} item={item} />
                      ))}
                    </AnimatePresence>
                  </CardContent>
                </Card>
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Input placeholder="Promo code" value={promoInput} onChange={(e) => setPromoInput(e.target.value)} aria-label="Promo code" id="promo-code" />
                      <Button variant="outline" onClick={() => applyPromoCode(promoInput)}>Apply</Button>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{formatPrice(subtotal)}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-primary">
                          <span>Discount <Badge variant="secondary">{promoCode}</Badge></span>
                          <span>-{formatPrice(subtotal * discount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span>{formatPrice(total)}</span>
                      </div>
                    </div>
                    <Button size="lg" className="w-full btn-gradient" onClick={handleCheckout} disabled={isCheckingOut}>
                      {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>
      <GuestCheckoutModal isOpen={showGuestModal} onOpenChange={setShowGuestModal} onSubmit={handleGuestCheckout} />
      <OrderConfirmation orderId={orderId} isOpen={!!orderId} onOpenChange={() => setOrderId(null)} />
      <Toaster richColors closeButton />
    </div>
  );
}