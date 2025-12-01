import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Toaster } from 'sonner';
import type { Product } from '@shared/types';
import { ProductCard, ProductCardSkeleton } from '@/components/ProductCard';
import { ProductQuickView } from '@/components/ProductQuickView';
import { CartDrawer } from '@/components/CartDrawer';
import { useCartMutations } from '@/hooks/use-cart';
import { useProducts } from '@/hooks/use-products';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { OrderConfirmation } from '@/components/OrderConfirmation';
import { useCartUi, useCartUiActions } from '@/hooks/use-cart';
const categories = ['Indoor', 'Outdoor', 'Succulents', 'Cacti'];
const tags = ['Full Sun', 'Partial Shade', 'Low Light', 'Pet-Friendly', 'Air Purifying'];
export function HomePage() {
  const navigate = useNavigate();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const { addToCart } = useCartMutations();
  const { orderId } = useCartUi();
  const { setOrderId } = useCartUiActions();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<{ categories: string[], tags: string[], priceRange: [number, number] }>({
    categories: [],
    tags: [],
    priceRange: [0, 200],
  });
  const { data: filteredProducts, isLoading } = useProducts({
    searchTerm,
    categories: filters.categories,
    tags: filters.tags,
    priceRange: filters.priceRange,
  });
  const handleFilterChange = (type: 'categories' | 'tags', value: string) => {
    setFilters(prev => {
      const current = prev[type];
      const next = current.includes(value) ? current.filter(item => item !== value) : [...current, value];
      return { ...prev, [type]: next };
    });
  };
  const handlePriceChange = (value: number[]) => {
    setFilters(prev => ({ ...prev, priceRange: [value[0], value[1]] }));
  };
  const handleAddToCart = (product: Product, variantSku: string, quantity: number) => {
    addToCart({ product, variantSku, quantity });
  };
  const FilterSidebar = () => (
    <aside className="lg:col-span-3 space-y-6">
      <h2 className="text-2xl font-semibold">Filters</h2>
      <Accordion type="multiple" defaultValue={['category', 'price', 'tags']} className="w-full">
        <AccordionItem value="category">
          <AccordionTrigger className="text-lg">Category</AccordionTrigger>
          <AccordionContent className="space-y-2">
            {categories.map(cat => (
              <div key={cat} className="flex items-center space-x-2">
                <Checkbox id={cat} onCheckedChange={() => handleFilterChange('categories', cat)} checked={filters.categories.includes(cat)} />
                <label htmlFor={cat} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{cat}</label>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="price">
          <AccordionTrigger className="text-lg">Price Range</AccordionTrigger>
          <AccordionContent className="pt-4">
            <Slider defaultValue={[0, 200]} max={200} step={10} onValueCommit={handlePriceChange} />
            <div className="flex justify-between text-sm text-muted-foreground mt-2">
              <span>${filters.priceRange[0]}</span>
              <span>${filters.priceRange[1]}</span>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="tags">
          <AccordionTrigger className="text-lg">Features</AccordionTrigger>
          <AccordionContent className="space-y-2">
            {tags.map(tag => (
              <div key={tag} className="flex items-center space-x-2">
                <Checkbox id={tag} onCheckedChange={() => handleFilterChange('tags', tag)} checked={filters.tags.includes(tag)} />
                <label htmlFor={tag} className="text-sm font-medium leading-none">{tag}</label>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </aside>
  );
  return (
    <div className="bg-background min-h-screen">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold font-display text-primary">Verdure</h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle className="relative top-0 right-0" />
            <CartDrawer />
          </div>
        </div>
      </header>
      <main>
        <section className="relative py-20 md:py-32 bg-secondary/50">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1973')] bg-cover bg-center opacity-20"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-5xl md:text-7xl font-display font-bold text-balance leading-tight">
              Bring Nature <span className="text-gradient">Indoors</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              Discover premium houseplants and accessories to transform your space into a green sanctuary.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="mt-8">
              <Button size="lg" className="btn-gradient" onClick={() => document.getElementById('product-grid')?.scrollIntoView({ behavior: 'smooth' })}>
                Shop All Plants
              </Button>
            </motion.div>
          </div>
        </section>
        <div id="product-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8 md:py-10 lg:py-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <FilterSidebar />
              <div className="lg:col-span-9">
                <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                  <div className="relative w-full sm:max-w-xs">
                    <Input placeholder="Search plants..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">{filteredProducts?.length ?? 0} products found</p>
                </div>
                <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                  <AnimatePresence>
                    {isLoading
                      ? Array.from({ length: 9 }).map((_, i) => <ProductCardSkeleton key={i} />)
                      : filteredProducts?.map(product => (
                          <ProductCard
                            key={product.id}
                            product={product}
                            onAddToCart={(prod, sku) => handleAddToCart(prod, sku, 1)}
                            onQuickView={setQuickViewProduct}
                          />
                        ))}
                  </AnimatePresence>
                </motion.div>
                {!isLoading && filteredProducts?.length === 0 && (
                    <div className="text-center py-16 col-span-full">
                        <p className="text-lg font-semibold">No plants match your criteria.</p>
                        <p className="text-muted-foreground">Try adjusting your filters.</p>
                    </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className="border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Verdure. Built with ❤️ at Cloudflare.</p>
        </div>
      </footer>
      <ProductQuickView
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onOpenChange={(isOpen) => !isOpen && setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
      />
      <OrderConfirmation
        orderId={orderId}
        isOpen={!!orderId}
        onOpenChange={() => setOrderId(null)}
      />
      <Toaster richColors closeButton />
    </div>
  );
}