import React, { useState, useEffect } from 'react';
import { Search, Eye, Package, Wifi, WifiOff, AlertCircle, Palette } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useOrders, useUpdateOrderStatus, Order, OrderStatus } from '@/hooks/useOrders';
import { useAuth } from '@/context/AuthContext';
import CustomizationOrderCard from '@/components/admin/CustomizationOrderCard';

const statusOptions: { value: OrderStatus; label: string; color: string }[] = [
  { value: 'placed', label: 'Placed', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'packed', label: 'Packed', color: 'bg-blue-100 text-blue-700' },
  { value: 'shipped', label: 'Shipped', color: 'bg-purple-100 text-purple-700' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-700' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-700' },
];

const AdminOrders: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { data: orders = [], isLoading, error } = useOrders();
  const updateOrderStatus = useUpdateOrderStatus();
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('AdminOrders Debug:', {
      user: user?.email,
      isAdmin,
      ordersCount: orders.length,
      isLoading,
      error: error?.message
    });
  }, [user, isAdmin, orders, isLoading, error]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      setIsLive(prev => !prev); // Toggle to show animation
      setTimeout(() => setIsLive(true), 500);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_phone.includes(searchQuery);
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    await updateOrderStatus.mutateAsync({ id: orderId, status });
  };

  const openDetails = (order: Order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  const getStatusColor = (status: OrderStatus) => {
    return statusOptions.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-700';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Admin Check */}
        {!isAdmin && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div>
              <h3 className="font-medium text-red-800">Access Denied</h3>
              <p className="text-red-600 text-sm">You don't have admin privileges to view orders.</p>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div>
              <h3 className="font-medium text-red-800">Error Loading Orders</h3>
              <p className="text-red-600 text-sm">{error.message}</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold flex items-center gap-3">
              Orders
              <div className="flex items-center gap-2 text-sm">
                {isLive ? (
                  <>
                    <Wifi className="h-4 w-4 text-green-500 animate-pulse" />
                    <span className="text-green-500 font-medium">LIVE</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 text-red-500" />
                    <span className="text-red-500">OFFLINE</span>
                  </>
                )}
              </div>
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage and track customer orders • Last updated: {lastUpdate.toLocaleTimeString()}
              {user && ` • Logged in as: ${user.email}`}
              {isAdmin && ` • Admin: YES`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{orders.length}</p>
            <p className="text-sm text-muted-foreground">Total Orders</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by order ID, name, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {statusOptions.map(status => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Customization Orders Section */}
        {filteredOrders.some(order => order.items.some(item => item.customization)) && (
          <div className="mb-8">
            <h2 className="font-heading text-xl font-bold mb-4 flex items-center gap-2">
              <Palette className="h-5 w-5 text-purple-600" />
              Customization Orders
            </h2>
            <div className="grid gap-4">
              {filteredOrders
                .filter(order => order.items.some(item => item.customization))
                .map((order) => (
                  <CustomizationOrderCard
                    key={order.id}
                    order={order}
                    onViewDetails={setSelectedOrder}
                  />
                ))}
            </div>
          </div>
        )}

        {/* Regular Orders Table */}
        <div className="bg-card rounded-2xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Order ID</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Customer</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Items</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={7} className="px-6 py-4">
                        <div className="h-8 bg-muted rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {orders.length === 0 ? 'No orders yet' : 'No orders match your search'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 font-medium">{order.order_number}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">{order.customer_name}</p>
                          <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex -space-x-2">
                          {order.items.slice(0, 3).map((item, index) => (
                            <img
                              key={index}
                              src={item.product_image}
                              alt=""
                              className="w-8 h-8 rounded-full border-2 border-card object-cover"
                            />
                          ))}
                          {order.items.length > 3 && (
                            <div className="w-8 h-8 rounded-full border-2 border-card bg-muted flex items-center justify-center text-xs">
                              +{order.items.length - 3}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium">₹{order.total.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleStatusChange(order.id, value as OrderStatus)}
                        >
                          <SelectTrigger className={`w-[130px] ${getStatusColor(order.status)}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map(status => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDetails(order)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl">
              Order #{selectedOrder?.order_number}
            </DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                <span className="font-medium">Status</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
              </div>

              {/* Customer Info */}
              <div className="p-4 bg-muted/50 rounded-xl space-y-2">
                <h3 className="font-heading font-bold mb-3">Customer Information</h3>
                <p><span className="text-muted-foreground">Name:</span> {selectedOrder.customer_name}</p>
                <p><span className="text-muted-foreground">Phone:</span> {selectedOrder.customer_phone}</p>
                <p><span className="text-muted-foreground">Address:</span> {selectedOrder.customer_address}</p>
                <p><span className="text-muted-foreground">City:</span> {selectedOrder.customer_city}, {selectedOrder.customer_state} - {selectedOrder.customer_pincode}</p>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-heading font-bold mb-3">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-muted/50 rounded-xl">
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-bold">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center p-4 bg-primary/10 rounded-xl">
                <span className="font-heading font-bold text-lg">Total</span>
                <span className="font-heading font-bold text-2xl">₹{selectedOrder.total.toLocaleString()}</span>
              </div>

              {/* Dates */}
              <div className="text-sm text-muted-foreground">
                <p>Created: {new Date(selectedOrder.created_at).toLocaleString()}</p>
                <p>Updated: {new Date(selectedOrder.updated_at).toLocaleString()}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminOrders;
