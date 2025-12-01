import { Link } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useRelatedProducts } from '@/hooks/use-products';
type RelatedProductsCarouselProps = {
  productId: string;
};
const formatPrice = (price: number) => `${(price / 100).toFixed(2)}`;
export function RelatedProductsCarousel({ productId }: RelatedProductsCarouselProps) {
  const { data: products, isLoading } = useRelatedProducts(productId);
  const [emblaRef] = useEmblaCarousel({
    align: 'start',
    loop: false,
    dragFree: true,
  });
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <Skeleton className="aspect-square w-full" />
            <CardContent className="p-4 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  if (!products || products.length === 0) {
    return <div className="text-center text-muted-foreground py-8">No related items found.</div>;
  }
  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <div className="flex gap-4">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            className="flex-shrink-0 flex-grow-0 basis-1/2 md:basis-1/3 lg:basis-1/4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Link to={`/products/${product.slug}`} className="block group" aria-label={`View details for ${product.name}`}>
              <Card className="overflow-hidden h-full transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
                <CardHeader className="p-0 border-b">
                  <div className="overflow-hidden aspect-square relative">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <h3 className="font-semibold leading-tight truncate">{product.name}</h3>
                  <div className="flex items-baseline justify-between mt-2">
                    <p className="text-muted-foreground">{product.category}</p>
                    <p className="font-bold text-primary">${formatPrice(product.price)}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}