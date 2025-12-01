import { useState } from 'react';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useCart, useCartActions, useCartUi } from '@/hooks/use-cart';
import type { CartItem } from '@shared/types';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { GuestCheckoutModal } from './GuestCheckoutModal';
const formatPrice = (price: number) => `$${(price / 100).toFixed(2)}`;
function CartItemView({ item }: { item: CartItem }) {
  const { updateQuantity, removeFromCart } = useCartActions();
  return (
    <div className="flex items-center gap-4 py-4">
      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
      <div className="flex-grow">
        <p className="font-semibold">{item.name}</p>
        <p className="text-sm text-muted-foreground">{item.variantName}</p>
        <p className="text-sm font-medium">{formatPrice(item.price)}</p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center border rounded-md">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity({ itemId: item.id, quantity: item.quantity - 1 })}>-</Button>
          <span className="w-8 text-center text-sm">{item.quantity}</span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity({ itemId: item.id, quantity: item.quantity + 1 })}>+</Button>
        </div>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive" onClick={() => removeFromCart(item.id)}>
          <Trash2 className="h-4 w-4 mr-1" /> Remove
        </Button>
      </div>
    </div>
  );
}
export function CartDrawer() {
  const navigate = useNavigate();
  const { data: cart } = useCart();
  const { isCartOpen, discount, promoCode } = useCartUi();
  const { toggleCart, checkout, isAuthenticated, applyPromoCode, isCheckingOut } = useCartActions();
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
    <>
      <Sheet open={isCartOpen} onOpenChange={toggleCart}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {itemCount}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-md flex flex-col">
          <SheetHeader>
            <SheetTitle className="text-2xl font-display">Your Cart</SheetTitle>
          </SheetHeader>
          <Separator />
          {cart && cart.items.length > 0 ? (
            <div className="flex-grow overflow-y-auto -mx-6 px-6">
              {cart.items.map(item => (
                <CartItemView key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-center">
              <ShoppingCart className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-semibold">Your cart is empty</p>
              <p className="text-muted-foreground">Find a new plant friend to take home!</p>
            </div>
          )}
          {cart && cart.items.length > 0 && (
            <SheetFooter className="mt-auto">
              <div className="w-full space-y-4">
                <Separator />
                <div className="flex items-center gap-2">
                  <Input placeholder="Promo code" value={promoInput} onChange={(e) => setPromoInput(e.target.value)} />
                  <Button variant="outline" onClick={() => applyPromoCode(promoInput)}>Apply</Button>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
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
              </div>
            </SheetFooter>
          )}
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