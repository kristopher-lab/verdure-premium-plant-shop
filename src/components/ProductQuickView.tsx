import { useState, useEffect } from 'react';
import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import type { Product } from '@shared/types';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Skeleton } from './ui/skeleton';
type ProductQuickViewProps = {
  product: Product | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddToCart: (product: Product, variantSku: string, quantity: number) => void;
};
export function ProductQuickView({ product, isOpen, onOpenChange, onAddToCart }: ProductQuickViewProps) {
  const [selectedVariantSku, setSelectedVariantSku] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  useEffect(() => {
    if (product) {
      setSelectedVariantSku(product.variants[0]?.sku);
      setQuantity(1);
      setImageLoaded(false);
    }
  }, [product]);
  if (!product) return null;
  const selectedVariant = product.variants.find(v => v.sku === selectedVariantSku);
  const formatPrice = (price: number) => `${(price / 100).toFixed(2)}`;
  const handleAddToCart = () => {
    if (selectedVariant?.inventory <= 0) {
      toast.error('This variant is out of stock');
      return;
    }
    if (selectedVariantSku) {
      onAddToCart(product, selectedVariantSku, quantity);
      onOpenChange(false);
    }
  };
  const isOutOfStock = !selectedVariant || selectedVariant.inventory <= 0;
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[800px] p-0"
        asChild
        onKeyDown={(e) => { if (e.key === 'Escape') onOpenChange(false) }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-2 relative">
              {!imageLoaded && <Skeleton className="absolute inset-2 w-auto h-auto object-cover rounded-lg aspect-square" />}
              <img 
                src={product.images[0]} 
                alt={product.name} 
                className="w-full h-full object-cover rounded-lg aspect-square" 
                loading="lazy" 
                onLoad={() => setImageLoaded(true)}
                style={{ display: imageLoaded ? 'block' : 'none' }}
              />
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
                    aria-label="Select product size"
                  >
                    {product.variants.map(variant => (
                      <div key={variant.sku}>
                        <RadioGroupItem value={variant.sku} id={`quickview-${variant.sku}`} className="sr-only" aria-describedby={variant.inventory <= 0 ? `variant-stock-status-${variant.sku}` : undefined} />
                        <Label
                          htmlFor={`quickview-${variant.sku}`}
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
                        >
                          {variant.name}
                          {variant.inventory <= 0 && <Badge id={`variant-stock-status-${variant.sku}`} variant="destructive" className="ml-2 mt-1">Out of Stock</Badge>}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                <div className="flex items-center gap-4">
                  <Label className="text-sm font-medium">Quantity</Label>
                  <div className="flex items-center gap-2 border rounded-md p-1">
                    <Button variant="ghost" size="icon" onClick={() => setQuantity(q => Math.max(1, q - 1))} aria-label="Decrease quantity">
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-semibold" aria-live="polite">{quantity}</span>
                    <Button variant="ghost" size="icon" onClick={() => setQuantity(q => q + 1)} aria-label="Increase quantity">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <Button size="lg" className="w-full mt-6" onClick={handleAddToCart} disabled={isOutOfStock}>
                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </Button>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}