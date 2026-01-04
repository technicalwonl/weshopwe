import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

export type OrderStatus = 'placed' | 'packed' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  product_id: string;
  product_name: string;
  product_image: string;
  quantity: number;
  price: number;
  customization?: {
    image: string | null;
    text: string;
    quoted_price?: number;
  };
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_city: string;
  customer_state: string;
  customer_pincode: string;
  created_at: string;
  updated_at: string;
}

export interface OrderInput {
  items: OrderItem[];
  total: number;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_city: string;
  customer_state: string;
  customer_pincode: string;
}

export const useOrders = () => {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAdmin) return;

    console.log('Setting up real-time subscription for orders...');
    
    // Set up real-time subscription for orders
    const channel = supabase
      .channel('orders_changes_v2')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          console.log('Order change received:', payload);
          
          // Invalidate all order-related queries
          queryClient.invalidateQueries({ queryKey: ['orders'] });
          queryClient.invalidateQueries({ queryKey: ['order'] });
          
          // Force refetch immediately
          queryClient.refetchQueries({ queryKey: ['orders'] });
          
          // Show notification for new orders
          if (payload.eventType === 'INSERT') {
            toast.success(`New order #${(payload.new as any)?.order_number} received!`);
          } else if (payload.eventType === 'UPDATE') {
            const oldStatus = (payload.old as any)?.status;
            const newStatus = (payload.new as any)?.status;
            if (oldStatus !== newStatus) {
              toast.info(`Order #${(payload.new as any)?.order_number} status updated to ${newStatus}`);
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to orders changes');
        } else if (status === 'TIMED_OUT' || status === 'CLOSED') {
          console.error('Subscription failed or closed');
        }
      });

    return () => {
      console.log('Cleaning up orders subscription');
      supabase.removeChannel(channel);
    };
  }, [isAdmin, queryClient]);

  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      console.log('Fetching orders...');
      try {
        console.log('Current user auth state:', { isAdmin });
        
        // Try the regular query first
        const { data, error, count } = await supabase
          .from('orders')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching orders:', error);
          console.error('Error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          throw error;
        }
        
        console.log('Orders fetched successfully:', {
          count: data?.length || 0,
          totalCount: count,
          sampleOrder: data?.[0]
        });
        
        // Ensure we return the data even if it's empty
        const orders = (data || []).map(order => ({
          ...order,
          items: order.items as unknown as OrderItem[],
          status: order.status as OrderStatus,
        })) as Order[];
        
        console.log('Processed orders:', orders.length);
        return orders;
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        throw err;
      }
    },
    enabled: isAdmin,
    refetchOnMount: 'always',
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 5,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 0, // Always consider data stale for real-time updates
  });
};

export const useUserOrders = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user?.id) return;

    console.log('Setting up real-time subscription for user orders...');
    
    // Set up real-time subscription for user orders
    const channel = supabase
      .channel('user_orders_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('User order change received:', payload);
          
          // Only invalidate if this order belongs to the current user
          if ((payload.new as any)?.user_id === user.id || (payload.old as any)?.user_id === user.id) {
            queryClient.invalidateQueries({ queryKey: ['orders', 'user', user.id] });
            queryClient.refetchQueries({ queryKey: ['orders', 'user', user.id] });
            
            if (payload.eventType === 'UPDATE') {
              const oldStatus = (payload.old as any)?.status;
              const newStatus = (payload.new as any)?.status;
              if (oldStatus !== newStatus) {
                toast.info(`Your order #${(payload.new as any)?.order_number} status updated to ${newStatus}`);
              }
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('User subscription status:', status);
      });

    return () => {
      console.log('Cleaning up user orders subscription');
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  return useQuery({
    queryKey: ['orders', 'user', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      console.log('Fetching user orders for:', user.id);
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user orders:', error);
        throw error;
      }
      
      console.log('User orders fetched:', data?.length || 0);
      return (data || []).map(order => ({
        ...order,
        items: order.items as unknown as OrderItem[],
        status: order.status as OrderStatus,
      })) as Order[];
    },
    enabled: !!user?.id,
    refetchOnMount: 'always',
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 0,
  });
};

export const useOrder = (id: string) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      return {
        ...data,
        items: data.items as unknown as OrderItem[],
        status: data.status as OrderStatus,
      } as Order;
    },
    enabled: !!id,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: OrderInput) => {
      console.log('Creating order:', orderData);
      
      const { data, error } = await supabase
        .from('orders')
        .insert([{
          ...orderData,
          items: orderData.items as any, // Convert to JSON
          order_number: `ORD-${Date.now()}`,
          status: 'placed',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order placed successfully!');
      console.log('Order created:', data);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to place order');
      console.error('Order creation error:', error);
    },
  });
};

export const useCreateCustomizationOrder = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (customizationData: {
      productId: string;
      productName: string;
      image: string | null;
      text: string;
      userContact: {
        name: string;
        email: string;
        phone: string;
        address: string;
        street: string;
        pincode: string;
      };
      quotedPrice?: number;
    }) => {
      console.log('Creating customization order:', customizationData);
      
      // Create order from customization request
      const orderData = {
        items: [{
          product_id: customizationData.productId,
          product_name: customizationData.productName,
          product_image: customizationData.image || 'https://images.unsplash.com/photo-1521572163474-6814f0e4dbb9?w=400&h=400&fit=crop',
          quantity: 1,
          price: 0, // No price for embroidery orders
          customization: {
            image: customizationData.image,
            text: customizationData.text,
            quoted_price: null // No quoted price initially
          }
        }],
        total: 0, // No total for embroidery orders
        customer_name: customizationData.userContact.name,
        customer_phone: customizationData.userContact.phone,
        customer_address: `${customizationData.userContact.address}, ${customizationData.userContact.street}`,
        customer_city: 'To be confirmed',
        customer_state: 'To be confirmed',
        customer_pincode: customizationData.userContact.pincode,
      };

      const { data, error } = await supabase
        .from('orders')
        .insert([{
          ...orderData,
          items: orderData.items as any, // Convert to JSON
          order_number: `CUST-${Date.now()}`,
          status: 'placed',
          user_id: user?.id || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Customization order placed successfully! Our team will contact you soon.');
      console.log('Customization order created:', data);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to place customization order');
      console.error('Customization order creation error:', error);
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
      console.log('Updating order status:', { id, status });

      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select();

      if (error) {
        console.error('Error updating order status:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error('Order status update was blocked (0 rows updated). Verify admin role + orders UPDATE RLS policy.');
      }
      
      console.log('Order status updated successfully:', data);

      return data[0];
    },
    onSuccess: (data, variables) => {
      console.log('Update success callback:', data);
      queryClient.setQueryData(['orders'], (current: Order[] | undefined) => {
        if (!current) return current;
        return current.map((o) => (o.id === variables.id ? { ...o, status: variables.status } : o));
      });

      const updatedUserId = (data as any)?.user_id as string | null | undefined;
      if (updatedUserId) {
        queryClient.setQueryData(['orders', 'user', updatedUserId], (current: Order[] | undefined) => {
          if (!current) return current;
          return current.map((o) => (o.id === variables.id ? { ...o, status: variables.status } : o));
        });
      }

      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.id] });
      if ((data as any)?.user_id) {
        queryClient.invalidateQueries({ queryKey: ['orders', 'user', (data as any).user_id] });
      }
      queryClient.refetchQueries({ queryKey: ['orders'] });
      toast.success(`Order #${(data as any)?.order_number || variables.id} status updated to ${variables.status}`);
    },
    onError: (error: any) => {
      console.error('Update order status error:', error);
      toast.error(error.message || 'Failed to update order');
    },
    onSettled: () => {
      // Ensure refetch regardless of success or failure
      queryClient.refetchQueries({ queryKey: ['orders'] });
    },
  });
};
