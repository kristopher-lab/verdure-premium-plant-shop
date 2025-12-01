import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetDescription } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useCart, useCartActions, useCartUi } from '@/hooks/use-cart';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { GuestCheckoutModal } from './GuestCheckoutModal';
import { motion } from 'framer-motion';
const formatPrice = (price: number) => `${(price / 100).toFixed(2)}`;
export function CartDrawer() {
  const { data: cart } = useCart();
  const { isCartOpen, discount } = useCartUi();
  const { toggleCart, checkout, isAuthenticated, isCheckingOut } = useCartActions();
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
    <>
      <Sheet open={isCartOpen} onOpenChange={toggleCart}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="relative min-h-11 min-w-11" aria-label={`Open cart, ${itemCount} items`}>
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {itemCount}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-md flex flex-col" role="dialog" aria-modal="true" aria-labelledby="cart-title" aria-describedby="cart-description">
          <SheetHeader>
            <SheetTitle id="cart-title" className="text-2xl font-display">Your Cart</SheetTitle>
            <SheetDescription id="cart-description">A summary of items in your shopping cart.</SheetDescription>
          </SheetHeader>
          <Separator />
          {cart && cart.items.length > 0 ? (
            <div className="flex-grow flex flex-col justify-center text-center">
                <p className="text-lg font-semibold">{itemCount} {itemCount > 1 ? 'items' : 'item'} in your cart</p>
                <p className="text-muted-foreground">Subtotal: {formatPrice(total)}</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex-grow flex flex-col items-center justify-center text-center"
            >
              <ShoppingCart className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-semibold">Your cart is empty</p>
              <p className="text-muted-foreground">Find a new plant friend to take home!</p>
            </motion.div>
          )}
          <SheetFooter className="mt-auto">
            <div className="w-full space-y-2">
              <Button size="lg" className="w-full min-h-11 hover:shadow-glow hover:scale-105 transition-all duration-200" asChild variant="outline" aria-label="View cart details and checkout">
                <Link to="/cart" onClick={() => toggleCart(false)}>View Cart & Checkout</Link>
              </Button>
              <Button size="lg" className="w-full btn-gradient min-h-11 hover:shadow-glow hover:scale-105 transition-all duration-200" onClick={handleCheckout} disabled={isCheckingOut || itemCount === 0} aria-label="Proceed to checkout">
                {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      <GuestCheckoutModal
        isOpen={showGuestModal}
        onOpenChange={setShowGuestModal}
        onSubmit={handleGuestCheckout}
      />
    </>
  );
}