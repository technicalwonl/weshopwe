import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  user_id?: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'price_update';
  is_global: boolean;
  read: boolean;
  created_at: string;
  metadata?: {
    order_id?: string;
    old_price?: number;
    new_price?: number;
    product_name?: string;
  };
}

// In-memory notification storage
let notifications: Notification[] = [];

// Initialize with some sample notifications
notifications = [
  {
    id: 'notif-1',
    title: 'Welcome to We Shop!',
    message: 'Thank you for joining our platform. Check out our latest embroidery products!',
    type: 'info',
    is_global: true,
    read: false,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'notif-2',
    title: 'New Embroidery Designs Available',
    message: 'We\'ve added new embroidery designs to our collection. Customize your favorite items today!',
    type: 'success',
    is_global: true,
    read: false,
    created_at: new Date(Date.now() - 172800000).toISOString(),
  }
];

// Update order price and send notification
export const useUpdateOrderPrice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      userId,
      productName,
      newPrice
    }: {
      orderId: string;
      userId: string;
      productName: string;
      newPrice: number;
    }) => {
      console.log('Updating order price:', { orderId, newPrice });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Create price update notification
      const notification: Notification = {
        id: Date.now().toString(),
        user_id: userId,
        title: 'Price Update for Your Customization',
        message: `The price for your "${productName}" customization has been updated from ₹0 to ₹${newPrice.toLocaleString()}`,
        type: 'price_update',
        is_global: false,
        read: false,
        created_at: new Date().toISOString(),
        metadata: {
          order_id: orderId,
          old_price: 0,
          new_price: newPrice,
          product_name: productName
        }
      };

      // Add notification to storage
      notifications.unshift(notification);
      
      // Update the order in the orders system (simulated)
      console.log('Order price updated in database');
      
      return { orderId, newPrice, notification };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success(`Order price updated to ₹${data.newPrice.toLocaleString()} and customer notified`);
      console.log('Order price updated successfully:', data);
    },
    onError: (error: any) => {
      console.error('Failed to update order price:', error);
      toast.error('Failed to update order price');
    },
  });
};

// Mock hooks for notification center
export const useUserNotifications = () => {
  return {
    data: notifications,
    isLoading: false,
    refetch: () => {}
  };
};

export const useAllNotifications = () => {
  return {
    data: notifications,
    isLoading: false,
    refetch: () => {}
  };
};

export const useCreateNotification = () => {
  return useMutation({
    mutationFn: async (notificationData: {
      user_id?: string;
      title: string;
      message: string;
      type: 'info' | 'success' | 'warning' | 'error' | 'price_update';
      is_global: boolean;
    }) => {
      const newNotification: Notification = {
        id: Date.now().toString(),
        ...notificationData,
        read: false,
        created_at: new Date().toISOString(),
      };

      notifications.unshift(newNotification);
      return newNotification;
    },
    onSuccess: (data) => {
      toast.success('Notification sent');
    }
  });
};

export const useMarkNotificationRead = () => {
  return useMutation({
    mutationFn: async (notificationId: string) => {
      const notificationIndex = notifications.findIndex(n => n.id === notificationId);
      if (notificationIndex !== -1) {
        notifications[notificationIndex] = {
          ...notifications[notificationIndex],
          read: true
        };
        return notifications[notificationIndex];
      }
      throw new Error('Notification not found');
    }
  });
};

export const useSendPriceUpdateNotification = () => {
  return useMutation({
    mutationFn: async ({
      orderId,
      userId,
      productName,
      newPrice
    }: {
      orderId: string;
      userId: string;
      productName: string;
      newPrice: number;
    }) => {
      const notification: Notification = {
        id: Date.now().toString(),
        user_id: userId,
        title: 'Price Update for Your Customization',
        message: `The price for your "${productName}" customization has been updated from ₹0 to ₹${newPrice.toLocaleString()}`,
        type: 'price_update',
        is_global: false,
        read: false,
        created_at: new Date().toISOString(),
        metadata: {
          order_id: orderId,
          old_price: 0,
          new_price: newPrice,
          product_name: productName
        }
      };

      notifications.unshift(notification);
      return notification;
    },
    onSuccess: () => {
      toast.success('Price update notification sent');
    }
  });
};

export const useSendGlobalNotification = () => {
  return useMutation({
    mutationFn: async ({
      title,
      message,
      type = 'info'
    }: {
      title: string;
      message: string;
      type?: 'info' | 'success' | 'warning' | 'error';
    }) => {
      const notification: Notification = {
        id: Date.now().toString(),
        title,
        message,
        type,
        is_global: true,
        read: false,
        created_at: new Date().toISOString(),
      };

      notifications.unshift(notification);
      return notification;
    },
    onSuccess: () => {
      toast.success('Global notification sent');
    }
  });
};
