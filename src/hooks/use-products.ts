import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api-client';
import type { Product } from '@shared/types';
type ProductFilters = {
  searchTerm?: string;
  categories?: string[];
  tags?: string[];
  priceRange?: [number, number];
};
const fetchProducts = async (): Promise<{ items: Product[], next: string | null }> => {
  return get('/api/products');
};
export const useProducts = (filters: ProductFilters) => {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    select: (data) => {
      if (!data) return [];
      return data.items
        .filter(p => filters.searchTerm ? p.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) : true)
        .filter(p => filters.categories && filters.categories.length > 0 ? filters.categories.includes(p.category) : true)
        .filter(p => filters.tags && filters.tags.length > 0 ? filters.tags.some(tag => p.tags.includes(tag as any)) : true)
        .filter(p => filters.priceRange ? (p.price / 100) >= filters.priceRange[0] && (p.price / 100) <= filters.priceRange[1] : true);
    }
  });
};
const fetchProduct = async (id: string): Promise<Product> => {
  return get(`/api/products/${id}`);
};
export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProduct(id),
    enabled: !!id,
  });
};
const fetchRelatedProducts = async (id: string): Promise<Product[]> => {
  return get(`/api/products/${id}/related`);
};
export const useRelatedProducts = (id: string) => {
  return useQuery({
    queryKey: ['related-products', id],
    queryFn: () => fetchRelatedProducts(id),
    enabled: !!id,
  });
};