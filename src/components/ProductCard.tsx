import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Product } from '@shared/types';
import { Badge } from './ui/badge';
type ProductCardProps = {
  product: Product;
  onAddToCart: (product: Product, variantSku: string) => void;
  onQuickView: (product: Product) => void;
};
export function ProductCard({ product, onAddToCart, onQuickView }: ProductCardProps) {
  const formatPrice = (price: number) => `${(price / 100).toFixed(2)}`;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="group relative"
    >
      <Card className="overflow-hidden h-full flex flex-col transition-all duration-300 ease-in-out hover:shadow-glow hover:-translate-y-2 active:scale-95">
        <CardHeader className="p-0 border-b">
          <div className="overflow-hidden aspect-[4/3] relative">
            <img
              src={product.images?.[0] ?? ''}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <motion.div variants={{ hover: { scale: 1.05 } }} whileHover="hover">
                <Button variant="secondary" onClick={() => onQuickView(product)} aria-label={`Open quick view for ${product.name}`}>
                  Quick View
                </Button>
              </motion.div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg font-semibold leading-tight">{product.name}</CardTitle>
            <div className="text-lg font-bold text-primary whitespace-nowrap">{formatPrice(product.price)}</div>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            <Badge variant="outline">{product.category}</Badge>
            {product.tags.slice(0, 1).map(tag => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button
            className="w-full"
            onClick={() => onAddToCart(product, product.variants[0].sku)}
          >
            <Plus className="mr-2 h-4 w-4" /> Add to Cart
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
export function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-[4/3] w-full animate-shimmer" />
      <CardContent className="p-4 space-y-2">
        <Skeleton className="h-6 w-3/4 animate-shimmer" />
        <Skeleton className="h-4 w-1/2 animate-shimmer" />
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Skeleton className="h-10 w-full animate-shimmer" />
      </CardFooter>
    </Card>
  );
}