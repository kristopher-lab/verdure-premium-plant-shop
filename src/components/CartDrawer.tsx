import { ShoppingCart, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useCart, useCartActions } from '@/hooks/use-cart';
import type { CartItem } from '@shared/types';
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
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</Button>
          <span className="w-8 text-center text-sm">{item.quantity}</span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</Button>
        </div>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive" onClick={() => removeFromCart(item.id)}>
          <Trash2 className="h-4 w-4 mr-1" /> Remove
        </Button>
      </div>
    </div>
  );
}
export function CartDrawer() {
  const { cart, isCartOpen } = useCart();
  const { toggleCart, checkout } = useCartActions();
  const itemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  return (
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
              <div className="flex justify-between font-semibold text-lg">
                <span>Subtotal</span>
                <span>{formatPrice(cart.subtotal)}</span>
              </div>
              <Button size="lg" className="w-full btn-gradient" onClick={checkout}>
                Proceed to Checkout
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}