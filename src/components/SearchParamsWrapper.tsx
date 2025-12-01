import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { Product } from '@shared/types';
import { ProductCard, ProductCardSkeleton } from '@/components/ProductCard';
import { useProducts } from '@/hooks/use-products';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
const categories = ['Indoor', 'Outdoor', 'Succulents', 'Cacti'];
const tags = ['Full Sun', 'Partial Shade', 'Low Light', 'Pet-Friendly', 'Air Purifying'];
type SearchParamsWrapperProps = {
  setQuickViewProduct: (product: Product | null) => void;
  handleAddToCart: (product: Product, variantSku: string, quantity: number) => void;
};
export function SearchParamsWrapper({ setQuickViewProduct, handleAddToCart }: SearchParamsWrapperProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState<{ categories: string[], tags: string[], priceRange: [number, number] }>({
    categories: searchParams.getAll('category') || [],
    tags: searchParams.getAll('tag') || [],
    priceRange: [Number(searchParams.get('minPrice') || 0), Number(searchParams.get('maxPrice') || 200)],
  });
  const memoizedFilters = useMemo(() => filters, [filters]);
  const { data: filteredProducts, isLoading } = useProducts({
    searchTerm,
    categories: memoizedFilters.categories,
    tags: memoizedFilters.tags,
    priceRange: memoizedFilters.priceRange,
  });
  const handleFilterChange = (type: 'categories' | 'tags', value: string) => {
    setFilters(prev => {
      const current = prev[type];
      const next = current.includes(value) ? current.filter(item => item !== value) : [...current, value];
      const newParams = new URLSearchParams(searchParams);
      const paramKey = type === 'categories' ? 'category' : 'tag';
      newParams.delete(paramKey);
      next.forEach(item => newParams.append(paramKey, item));
      setSearchParams(newParams, { replace: true });
      return { ...prev, [type]: next };
    });
  };
  const handlePriceChange = (value: number[]) => {
    const newPriceRange: [number, number] = [value[0], value[1]];
    setFilters(prev => ({ ...prev, priceRange: newPriceRange }));
    const newParams = new URLSearchParams(searchParams);
    newParams.set('minPrice', String(newPriceRange[0]));
    newParams.set('maxPrice', String(newPriceRange[1]));
    setSearchParams(newParams, { replace: true });
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
                <Checkbox id={cat} onCheckedChange={() => handleFilterChange('categories', cat)} checked={filters.categories.includes(cat)} aria-label={`Filter by category: ${cat}`} />
                <label htmlFor={cat} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{cat}</label>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="price">
          <AccordionTrigger className="text-lg">Price Range</AccordionTrigger>
          <AccordionContent className="pt-4">
            <Slider defaultValue={filters.priceRange} max={200} step={10} onValueCommit={handlePriceChange} aria-valuetext={`Price range from ${filters.priceRange[0]} to ${filters.priceRange[1]}`} />
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
                <Checkbox id={tag} onCheckedChange={() => handleFilterChange('tags', tag)} checked={filters.tags.includes(tag)} aria-label={`Filter by feature: ${tag}`} />
                <label htmlFor={tag} className="text-sm font-medium leading-none">{tag}</label>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </aside>
  );
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <FilterSidebar />
      <div className="lg:col-span-9">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
          <div className="relative w-full sm:max-w-xs">
            <Input placeholder="Search plants..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} aria-label="Search plants" />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">{filteredProducts?.length ?? 0} products found</p>
        </div>
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.05,
              },
            },
          }}
          initial="hidden"
          animate="show"
        >
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
  );
}