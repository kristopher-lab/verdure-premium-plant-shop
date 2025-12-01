import { useQuery, useQueryClient } from '@tanstack/react-query';
import { get } from '@/lib/api-client';
import type { Product } from '@shared/types';
import { useEffect } from 'react';
type ProductFilters = {
  searchTerm?: string;
  categories?: string[];
  tags?: string[];
  priceRange?: [number, number];
};
const fetchProducts = async (): Promise<{ items: Product[], next: string | null }> => {
  try {
    return await get('/api/products?limit=100'); // Fetch more to allow for client-side filtering
  } catch (error) {
    console.error('Product fetch error:', error);
    throw error;
  }
};
export const useProducts = (filters: ProductFilters) => {
  return useQuery({
    queryKey: ['products'], // A single key for all products, filtering is done in select
    queryFn: fetchProducts,
    staleTime: 900000, // 15 minutes
    select: (data) => {
      try {
        if (!data?.items) return [];
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
  try {
    return await get(`/api/products/slug/${slug}`);
  } catch (error) {
    console.error(`Product fetch error for slug ${slug}:`, error);
    throw error;
  }
};
export const useProduct = (slug: string) => {
  const queryClient = useQueryClient();
  const queryResult = useQuery<Product, Error>({
    queryKey: ['product', slug],
    queryFn: () => fetchProductBySlug(slug),
    enabled: !!slug,
    staleTime: 900000, // 15 minutes
  });
  useEffect(() => {
    if (queryResult.data?.id) {
      queryClient.prefetchQuery({
        queryKey: ['related-products', queryResult.data.id],
        queryFn: () => fetchRelatedProducts(queryResult.data.id),
      });
    }
  }, [queryResult.data, queryClient]);
  return queryResult;
};
const fetchRelatedProducts = async (id: string): Promise<Product[]> => {
  try {
    return await get(`/api/products/${id}/related`);
  } catch (error) {
    console.error(`Related products fetch error for ID ${id}:`, error);
    throw error;
  }
};
export const useRelatedProducts = (id: string) => {
  return useQuery<Product[], Error>({
    queryKey: ['related-products', id],
    queryFn: () => fetchRelatedProducts(id),
    enabled: !!id,
    staleTime: 900000, // 15 minutes
  });
};