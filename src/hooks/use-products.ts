import { useQuery, useQueryClient } from '@tanstack/react-query';
import { get } from '@/lib/api-client';
import type { Product } from '@shared/types';
type ProductFilters = {
  searchTerm?: string;
  categories?: string[];
  tags?: string[];
  priceRange?: [number, number];
};
const fetchProducts = async (): Promise<{ items: Product[], next: string | null }> => {
  return get('/api/products?limit=100'); // Fetch more to allow for client-side filtering
};
export const useProducts = (filters: ProductFilters) => {
  const queryKey = ['products', filters];
  return useQuery({
    queryKey: ['products'], // A single key for all products, filtering is done in select
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5, // 5 minutes
    select: (data) => {
      try {
        if (!data) return [];
        return data.items
          .filter(p => filters.searchTerm ? p.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) : true)
          .filter(p => filters.categories && filters.categories.length > 0 ? filters.categories.includes(p.category) : true)
          .filter(p => filters.tags && filters.tags.length > 0 ? filters.tags.some(tag => p.tags.includes(tag as any)) : true)
          .filter(p => filters.priceRange ? (p.price / 100) >= filters.priceRange[0] && (p.price / 100) <= filters.priceRange[1] : true);
      } catch (error) {
        console.error("Error filtering products:", error);
        return [];
      }
    }
  });
};
const fetchProductBySlug = async (slug: string): Promise<Product> => {
  return get(`/api/products/slug/${slug}`);
};
export const useProduct = (slug: string) => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => fetchProductBySlug(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 10, // 10 minutes
    onSuccess: (data) => {
      // Prefetch related products for faster navigation
      if (data?.id) {
        queryClient.prefetchQuery({
          queryKey: ['related-products', data.id],
          queryFn: () => fetchRelatedProducts(data.id),
        });
      }
    },
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
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};