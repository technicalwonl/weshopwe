import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  discount: number | null;
  images: string[] | null;
  category: string;
  category_id: string | null;
  rating: number | null;
  reviews: number | null;
  stock: number | null;
  featured: boolean | null;
  trending: boolean | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface ProductInput {
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  discount?: number;
  images?: string[];
  category: string;
  category_id?: string;
  stock?: number;
  featured?: boolean;
  trending?: boolean;
  is_active?: boolean;
}

export const useProducts = (filters?: { category?: string; search?: string; featured?: boolean; trending?: boolean }) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (filters?.category) {
        query = query.ilike('category', filters.category);
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters?.featured) {
        query = query.eq('featured', true);
      }

      if (filters?.trending) {
        query = query.eq('trending', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Add embroidery products if none exist
      const products = data as Product[];
      const hasEmbroidery = products.some(p => 
        p.category.toLowerCase().includes('embroidery') || 
        p.name.toLowerCase().includes('embroidery')
      );
      
      if (!hasEmbroidery && products.length > 0) {
        // Add sample embroidery products for testing
        const embroideryProducts: Product[] = [
          {
            id: 'embroidery-1',
            name: 'Custom Embroidered T-Shirt',
            description: 'Premium quality t-shirt with custom embroidery options',
            price: 899,
            original_price: 1299,
            discount: 30,
            images: ['https://images.unsplash.com/photo-1521572163474-6814f0e4dbb9?w=400&h=400&fit=crop'],
            category: 'Embroidery',
            category_id: null,
            rating: 4.5,
            reviews: 12,
            stock: 50,
            featured: true,
            trending: true,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'embroidery-2',
            name: 'Embroidered Polo Shirt',
            description: 'Professional polo shirt with custom embroidery',
            price: 1299,
            original_price: 1799,
            discount: 25,
            images: ['https://images.unsplash.com/photo-1556821840-4a4f870063e7?w=400&h=400&fit=crop'],
            category: 'Embroidery',
            category_id: null,
            rating: 4.8,
            reviews: 8,
            stock: 30,
            featured: false,
            trending: false,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        
        return [...products, ...embroideryProducts];
      }
      
      return products;
    },
  });
};

export const useAllProducts = () => {
  return useQuery({
    queryKey: ['products', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Product[];
    },
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Product;
    },
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: ProductInput) => {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create product');
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...product }: Partial<ProductInput> & { id: string }) => {
      const { data, error } = await supabase
        .from('products')
        .update(product)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update product');
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete product');
    },
  });
};
