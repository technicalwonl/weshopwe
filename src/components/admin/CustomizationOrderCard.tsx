import React from 'react';
import { Eye, Download, Image, Type, CheckCircle, XCircle, Clock, Palette, Package, Truck, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Order, OrderItem } from '@/hooks/useOrders';
import { toast } from 'sonner';
import { useUpdateOrderPrice } from '@/hooks/useNotifications';

interface CustomizationOrderCardProps {
  order: Order;
  onViewDetails: (order: Order) => void;
}

const CustomizationOrderCard: React.FC<CustomizationOrderCardProps> = ({ order, onViewDetails }) => {
  // Check if this order has customization items
  const hasCustomization = order.items.some(item => item.customization);
  const updateOrderPrice = useUpdateOrderPrice();
  
  if (!hasCustomization) return null;

  const customizationItem = order.items.find(item => item.customization);
  const customization = customizationItem?.customization;

  const handleUpdatePrice = () => {
    const price = prompt('Enter the quoted price (in ₹):');
    if (price && !isNaN(Number(price)) && Number(price) > 0) {
      updateOrderPrice.mutate({
        orderId: order.id,
        userId: order.user_id || 'user-' + order.id, // Fallback user ID
        productName: customizationItem?.product_name || 'Custom Product',
        newPrice: Number(price)
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'placed':
        return 'bg-blue-100 text-blue-800';
      case 'packed':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'placed':
        return <Clock className="h-4 w-4" />;
      case 'packed':
        return <Package className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <Card className="border-purple-200 bg-purple-50/50 hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-purple-600" />
            <div>
              <CardTitle className="text-lg mb-2 flex items-center gap-2">
                {customizationItem?.product_name}
                <Badge variant="secondary" className="text-xs">
                  Customization
                </Badge>
              </CardTitle>
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getStatusColor(order.status)}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(order.status)}
                    <span className="capitalize">{order.status}</span>
                  </div>
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Order #{order.order_number}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                {new Date(order.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(order)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleUpdatePrice}
              disabled={updateOrderPrice.isPending}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              {updateOrderPrice.isPending ? 'Updating...' : 'Update Price'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Customer Info */}
          <div>
            <h4 className="font-medium mb-2">Customer Information</h4>
            <div className="text-sm space-y-1">
              <p><span className="font-medium">Name:</span> {order.customer_name}</p>
              <p><span className="font-medium">Phone:</span> {order.customer_phone}</p>
              <p><span className="font-medium">Address:</span> {order.customer_address}</p>
              <p><span className="font-medium">Pincode:</span> {order.customer_pincode}</p>
            </div>
          </div>

          {/* Customization Details */}
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Customization Details
            </h4>
            <div className="space-y-3">
              {customization?.image && (
                <div className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  <span className="text-sm">Custom image uploaded</span>
                  <Button variant="outline" size="sm" className="h-6 text-xs">
                    <Download className="h-3 w-3 mr-1" />
                    View
                  </Button>
                </div>
              )}
              
              {customization?.text && (
                <div className="flex items-start gap-2">
                  <Type className="h-4 w-4 mt-0.5" />
                  <div>
                    <span className="text-sm font-medium">Custom Text:</span>
                    <p className="text-sm text-muted-foreground mt-1">"{customization.text}"</p>
                  </div>
                </div>
              )}
              
              {customization?.quoted_price && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Quoted Price:</span>
                  <span className="text-sm font-bold text-green-600">
                    ₹{customization.quoted_price.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Order Total - Hide for embroidery orders */}
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="font-medium">Price:</span>
            <span className="font-bold text-lg text-purple-600">To be quoted</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomizationOrderCard;
