import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster } from 'sonner';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CartDrawer } from '@/components/CartDrawer';
import { useProduct } from '@/hooks/use-products';
import { useCartMutations, useCartUi, useCartUiActions } from '@/hooks/use-cart';
import { RelatedProductsCarousel } from '@/components/RelatedProductsCarousel';
import { OrderConfirmation } from '@/components/OrderConfirmation';
const formatPrice = (price: number) => `${(price / 100).toFixed(2)}`;
function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, error } = useProduct(slug || '');
  const { addToCart } = useCartMutations();
  const { orderId } = useCartUi();
  const { setOrderId } = useCartUiActions();
  const [selectedVariantSku, setSelectedVariantSku] = useState<string | undefined>();
  const [quantity, setQuantity] = useState(1);
  useEffect(() => {
    if (product && !selectedVariantSku) {
      setSelectedVariantSku(product.variants[0]?.sku);
    }
  }, [product, selectedVariantSku]);
  if (isLoading) return <ProductDetailSkeleton />;
  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12">
          <div className="flex flex-col items-center justify-center h-screen text-center">
            <div>
              <h2 className="text-2xl font-semibold">Product not found</h2>
              <Button asChild variant="link" className="mt-4">
                <Link to="/">Go back to shopping</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  const selectedVariant = product.variants.find(v => v.sku === selectedVariantSku);
  const handleAddToCart = () => {
    if (selectedVariantSku) {
      addToCart({ product, variantSku: selectedVariantSku, quantity });
    }
  };
  const isOutOfStock = !selectedVariant || selectedVariant.inventory <= 0;
  return (
    <div className="bg-background min-h-screen">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" role="navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Button asChild variant="ghost">
            <Link to="/" className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back to Plants
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <ThemeToggle className="relative top-0 right-0" />
            <CartDrawer />
          </div>
        </div>
      </header>
      <main role="main" aria-label="Product details" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
              <img src={product.images[0]} alt={product.name} className="w-full h-auto object-cover rounded-lg shadow-lg aspect-square" loading="lazy" />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <h1 className="text-4xl md:text-5xl font-display font-bold">{product.name}</h1>
              <div className="mt-4">
                <span className="text-4xl font-bold text-primary">{formatPrice(selectedVariant?.price ?? product.price)}</span>
              </div>
              <p className="mt-4 text-lg text-muted-foreground text-pretty">{product.description}</p>
              <div className="mt-6 space-y-6">
                <div>
                  <Label className="text-base font-semibold">Size</Label>
                  <RadioGroup value={selectedVariantSku} onValueChange={setSelectedVariantSku} className="flex gap-2 mt-2" aria-label="Select product size">
                    {product.variants.map(variant => (
                      <div key={variant.sku}>
                        <RadioGroupItem value={variant.sku} id={`detail-${variant.sku}`} className="sr-only" />
                        <Label htmlFor={`detail-${variant.sku}`} className="flex items-center justify-center rounded-md border-2 border-muted bg-popover px-4 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer" aria-label={`Select ${variant.name} size`}>
                          {variant.name}
                          {variant.inventory <= 0 && <Badge variant="destructive" className="ml-2">Out of Stock</Badge>}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                <div className="flex items-center gap-4">
                  <Label className="text-base font-semibold">Quantity</Label>
                  <div className="flex items-center gap-2 border rounded-md p-1">
                    <Button variant="ghost" size="icon" onClick={() => setQuantity(q => Math.max(1, q - 1))} aria-label="Decrease quantity"><Minus className="h-4 w-4" /></Button>
                    <span className="w-10 text-center font-semibold" aria-live="polite">{quantity}</span>
                    <Button variant="ghost" size="icon" onClick={() => setQuantity(q => q + 1)} aria-label="Increase quantity"><Plus className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>
              <Button size="lg" className="w-full mt-8 btn-gradient" onClick={handleAddToCart} disabled={isOutOfStock} aria-label={`Add ${product.name} to cart`}>
                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </Button>
            </motion.div>
          </div>
          <div className="mt-16 md:mt-24">
            <h2 className="text-3xl font-bold font-display text-center mb-8">You Might Also Like</h2>
            <RelatedProductsCarousel productId={product.id} />
          </div>
        </div>
      </main>
      <footer className="border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Verdure. Built with ❤️ at Cloudflare.</p>
        </div>
      </footer>
      <OrderConfirmation orderId={orderId} isOpen={!!orderId} onOpenChange={() => setOrderId(null)} />
      <Toaster richColors closeButton />
    </div>
  );
}
function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          <Skeleton className="w-full aspect-square rounded-lg" />
          <div className="space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-10 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <div className="space-y-4">
              <Skeleton className="h-6 w-1/4" />
              <div className="flex gap-4">
                <Skeleton className="h-12 w-20" />
                <Skeleton className="h-12 w-20" />
              </div>
            </div>
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
export default ProductDetail;