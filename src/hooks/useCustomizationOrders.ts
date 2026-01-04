import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface CustomizationOrder {
  id: string;
  productId: string;
  productName: string;
  image: string | null;
  text: string;
  userContact: {
    name: string;
    email: string;
    phone: string;
  };
  submittedAt: string;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  adminNotes?: string;
  quotedPrice?: number;
}

// Global in-memory storage with event system
let globalOrders: CustomizationOrder[] = [];
let orderUpdateCallbacks: (() => void)[] = [];

// Initialize with test data
globalOrders = [
  {
    id: 'test-1',
    productId: 'prod-1',
    productName: 'Custom Embroidered T-Shirt',
    image: 'https://images.unsplash.com/photo-1521572163474-6814f0e4dbb9?w=200&h=200&fit=crop',
    text: 'Happy Birthday Sarah! 2024',
    userContact: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567'
    },
    submittedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    status: 'pending' as const
  },
  {
    id: 'test-2',
    productId: 'prod-2',
    productName: 'Embroidered Polo Shirt',
    image: null,
    text: 'Company Logo - Annual Meeting',
    userContact: {
      name: 'Jane Smith',
      email: 'jane.smith@company.com',
      phone: '+1 (555) 987-6543'
    },
    submittedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    status: 'reviewed' as const,
    adminNotes: 'Customer wants company logo embroidery. Need high-res logo file.',
    quotedPrice: 4500
  }
];

// Event system for real-time updates
export const subscribeToOrderUpdates = (callback: () => void) => {
  orderUpdateCallbacks.push(callback);
  return () => {
    orderUpdateCallbacks = orderUpdateCallbacks.filter(cb => cb !== callback);
  };
};

const notifyOrderUpdate = () => {
  orderUpdateCallbacks.forEach(callback => callback());
};

export const useCustomizationOrders = () => {
  return useQuery({
    queryKey: ['customization-orders'],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      console.log('Fetching orders from global storage:', globalOrders);
      return globalOrders;
    },
    refetchInterval: 2000, // Poll every 2 seconds for real-time updates
  });
};

export const useSubmitCustomizationOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: {
      productId: string;
      productName: string;
      image: string | null;
      text: string;
      userContact: {
        name: string;
        email: string;
        phone: string;
      };
    }) => {
      console.log('Submitting new order:', orderData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const newOrder: CustomizationOrder = {
        id: Date.now().toString(),
        ...orderData,
        submittedAt: new Date().toISOString(),
        status: 'pending'
      };

      // Add to global storage
      globalOrders.push(newOrder);
      console.log('Order added to global storage:', newOrder);
      
      // Notify all subscribers
      notifyOrderUpdate();

      return newOrder;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['customization-orders'] });
      console.log('Customization order submitted successfully:', data);
      alert('Your customization request has been submitted! Our team will review it and contact you within 24-48 hours.');
    },
    onError: (error: any) => {
      console.error('Failed to submit customization order:', error);
      alert('Failed to submit customization request. Please try again.');
    },
  });
};

export const useUpdateCustomizationOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, updates }: {
      orderId: string;
      updates: Partial<CustomizationOrder>;
    }) => {
      console.log('Updating order:', orderId, updates);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      // Update in global storage
      const orderIndex = globalOrders.findIndex(order => order.id === orderId);
      
      if (orderIndex !== -1) {
        globalOrders[orderIndex] = {
          ...globalOrders[orderIndex],
          ...updates
        };
        console.log('Order updated in global storage:', globalOrders[orderIndex]);
        
        // Notify all subscribers
        notifyOrderUpdate();
        
        return globalOrders[orderIndex];
      }
      
      throw new Error('Order not found');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customization-orders'] });
      console.log('Customization order updated successfully');
      alert('Order status updated successfully!');
    },
    onError: (error: any) => {
      console.error('Failed to update customization order:', error);
      alert('Failed to update order. Please try again.');
    },
  });
};

export const useDeleteCustomizationOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      console.log('Deleting order:', orderId);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      // Remove from global storage
      globalOrders = globalOrders.filter(order => order.id !== orderId);
      console.log('Order deleted from global storage');
      
      // Notify all subscribers
      notifyOrderUpdate();

      return orderId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customization-orders'] });
      console.log('Customization order deleted successfully');
      alert('Order deleted successfully!');
    },
    onError: (error: any) => {
      console.error('Failed to delete customization order:', error);
      alert('Failed to delete order. Please try again.');
    },
  });
};
