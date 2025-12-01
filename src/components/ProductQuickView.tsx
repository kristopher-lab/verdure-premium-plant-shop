import { useState } from 'react';
import { X, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import type { Product } from '@shared/types';
type ProductQuickViewProps = {
  product: Product | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddToCart: (product: Product, variantSku: string, quantity: number) => void;
};
export function ProductQuickView({ product, isOpen, onOpenChange, onAddToCart }: ProductQuickViewProps) {
  const [selectedVariantSku, setSelectedVariantSku] = useState<string | undefined>(product?.variants[0]?.sku);
  const [quantity, setQuantity] = useState(1);
  if (!product) return null;
  const selectedVariant = product.variants.find(v => v.sku === selectedVariantSku);
  const formatPrice = (price: number) => `$${(price / 100).toFixed(2)}`;
  const handleAddToCart = () => {
    if (selectedVariantSku) {
      onAddToCart(product, selectedVariantSku, quantity);
      onOpenChange(false);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] p-0">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="p-2">
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover rounded-lg aspect-square" />
          </div>
          <div className="p-6 flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-3xl font-bold font-display">{product.name}</DialogTitle>
              <DialogDescription className="text-lg text-muted-foreground pt-2">{product.description}</DialogDescription>
            </DialogHeader>
            <div className="my-4">
              <span className="text-3xl font-bold text-primary">{formatPrice(selectedVariant?.price ?? product.price)}</span>
            </div>
            <div className="space-y-4 flex-grow">
              <div>
                <Label className="text-sm font-medium">Size</Label>
                <RadioGroup
                  value={selectedVariantSku}
                  onValueChange={setSelectedVariantSku}
                  className="flex gap-2 mt-2"
                >
                  {product.variants.map(variant => (
                    <div key={variant.sku}>
                      <RadioGroupItem value={variant.sku} id={variant.sku} className="sr-only" />
                      <Label
                        htmlFor={variant.sku}
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                      >
                        {variant.name}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              <div className="flex items-center gap-4">
                <Label className="text-sm font-medium">Quantity</Label>
                <div className="flex items-center gap-2 border rounded-md p-1">
                  <Button variant="ghost" size="icon" onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-semibold">{quantity}</span>
                  <Button variant="ghost" size="icon" onClick={() => setQuantity(q => q + 1)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <Button size="lg" className="w-full mt-6" onClick={handleAddToCart} disabled={!selectedVariantSku}>
              Add to Cart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}