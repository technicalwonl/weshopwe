import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const AdminSetup: React.FC = () => {
  const { isAuthenticated, loading: authLoading, checkRole } = useAuth();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'moderator' | 'super_admin'>('admin');
  const [loading, setLoading] = useState(false);
  const [ordersCount, setOrdersCount] = useState<number | null>(null);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!checkRole('super_admin')) {
    return <Navigate to="/" replace />;
  }

  const assignRole = async () => {
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.rpc('set_user_role_by_email' as any, {
        user_email: email,
        new_role: role,
      } as any);

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success(`Role ${role} assigned to ${email}. Please log out and log back in.`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign admin role');
    } finally {
      setLoading(false);
    }
  };

  const checkOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .limit(5);

      if (error) {
        toast.error(error.message);
      } else {
        setOrdersCount(data?.length || 0);
        toast.success(`Found ${data?.length || 0} orders in database`);
        console.log('Sample orders:', data);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to check orders');
    }
  };

  const createTestOrder = async () => {
    try {
      const testOrder = {
        order_number: `WS${Date.now()}`,
        user_id: null, // Simulate guest user order
        items: JSON.stringify([{
          product_id: "test-product",
          product_name: "Test Product",
          product_image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
          quantity: 1,
          price: 999
        }]),
        total: 999,
        status: "placed",
        customer_name: "Test Customer",
        customer_phone: "+919876543210",
        customer_address: "123 Test Street",
        customer_city: "Test City",
        customer_state: "Test State",
        customer_pincode: "123456"
      };

      const { data, error } = await supabase
        .from('orders')
        .insert([testOrder])
        .select();

      if (error) {
        toast.error(error.message);
        console.error('Order creation error:', error);
      } else {
        toast.success('Test order created successfully');
        console.log('Created order:', data);
        checkOrders(); // Refresh the count
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create test order');
      console.error('Test order creation failed:', error);
    }
  };

  const createBulkTestOrders = async () => {
    try {
      const bulkOrders = [];
      for (let i = 1; i <= 10; i++) {
        bulkOrders.push({
          order_number: `WS${Date.now()}${i}`,
          user_id: null,
          items: JSON.stringify([{
            product_id: `bulk-product-${i}`,
            product_name: `Bulk Test Product ${i}`,
            product_image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
            quantity: i,
            price: 999 * i
          }]),
          total: 999 * i,
          status: ["placed", "packed", "shipped", "delivered"][Math.floor(Math.random() * 4)] as any,
          customer_name: `Bulk Customer ${i}`,
          customer_phone: `+91987654321${i}`,
          customer_address: `${i} Bulk Street`,
          customer_city: "Bulk City",
          customer_state: "Bulk State",
          customer_pincode: `${100000 + i}`
        });
      }

      const { data, error } = await supabase
        .from('orders')
        .insert(bulkOrders)
        .select();

      if (error) {
        toast.error(error.message);
        console.error('Bulk orders creation error:', error);
      } else {
        toast.success(`Created ${bulkOrders.length} bulk test orders successfully`);
        console.log('Created bulk orders:', data);
        checkOrders(); // Refresh the count
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create bulk test orders');
      console.error('Bulk orders creation failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Admin Setup & Debug</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Assign Role</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Select value={role} onValueChange={(v) => setRole(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={assignRole} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Assigning...' : 'Assign Role'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orders Debug</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={checkOrders} className="w-full">
              Check Orders in Database
            </Button>
            {ordersCount !== null && (
              <p className="text-sm text-muted-foreground">
                Found {ordersCount} orders in database
              </p>
            )}
            <Button onClick={createTestOrder} variant="outline" className="w-full">
              Create Test Order
            </Button>
            <Button onClick={createBulkTestOrders} variant="outline" className="w-full">
              Create 10+ Bulk Test Orders (Live Testing)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Environment Info</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Check browser console for detailed debug information
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSetup;
