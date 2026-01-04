import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package, Truck, Home, ArrowRight, Loader2 } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useOrder } from '@/hooks/useOrders';
import { cn } from '@/lib/utils';

const statusSteps = [
  { key: 'placed', label: 'Order Placed', icon: CheckCircle },
  { key: 'packed', label: 'Packed', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Home },
];

const OrderConfirmation: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { data: order, isLoading, error } = useOrder(orderId || '');

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error || !order) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="font-heading text-3xl font-bold mb-4">Order Not Found</h1>
          <p className="text-muted-foreground mb-8">
            We couldn't find the order you're looking for.
          </p>
          <Link to="/products">
            <Button variant="gradient">Continue Shopping</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const currentStepIndex = statusSteps.findIndex((s) => s.key === order.status);

  return (
    <Layout>
      <div className="container py-8 md:py-16">
        {/* Success Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6 shadow-glow animate-scale-in">
            <CheckCircle className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Order Placed Successfully!
          </h1>
          <p className="text-lg text-muted-foreground mb-2">
            Thank you for shopping with WE SHOP
          </p>
          <p className="text-primary font-semibold text-xl">
            Order ID: {order.order_number}
          </p>
        </div>

        {/* Order Status */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <h2 className="font-heading text-xl font-semibold mb-6 text-center">
              Order Status
            </h2>
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-6 left-0 right-0 h-1 bg-muted mx-12 hidden sm:block">
                <div
                  className="h-full gradient-primary transition-all duration-500"
                  style={{
                    width: `${Math.max(0, (currentStepIndex / (statusSteps.length - 1)) * 100)}%`,
                  }}
                />
              </div>

              {/* Steps */}
              <div className="flex justify-between relative">
                {statusSteps.map((step, index) => {
                  const isCompleted = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;

                  return (
                    <div
                      key={step.key}
                      className="flex flex-col items-center flex-1"
                    >
                      <div
                        className={cn(
                          'w-12 h-12 rounded-full flex items-center justify-center transition-all z-10',
                          isCompleted
                            ? 'gradient-primary text-primary-foreground shadow-glow'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        <step.icon className="h-5 w-5" />
                      </div>
                      <span
                        className={cn(
                          'mt-3 text-sm font-medium text-center',
                          isCurrent ? 'text-primary' : 'text-muted-foreground'
                        )}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Items */}
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <h3 className="font-heading text-lg font-semibold mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex gap-4">
                  <img
                    src={item.product_image || '/placeholder.svg'}
                    alt={item.product_name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium line-clamp-1">{item.product_name}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    {/* Hide price for embroidery items */}
                    {item.customization ? (
                      <p className="font-medium text-purple-600">Price to be quoted</p>
                    ) : (
                      <p className="font-medium text-primary">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-border mt-4 pt-4">
              <div className="flex justify-between">
                <span className="font-medium">Total</span>
                {/* Hide total for embroidery orders */}
                {order.items.some(item => item.customization) ? (
                  <span className="font-bold text-lg text-purple-600">To be quoted</span>
                ) : (
                  <span className="font-bold text-lg gradient-text">
                    ₹{order.total.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <h3 className="font-heading text-lg font-semibold mb-4">Delivery Address</h3>
            <div className="space-y-2 text-muted-foreground">
              <p className="font-medium text-foreground">{order.customer_name}</p>
              <p>{order.customer_address}</p>
              <p>
                {order.customer_city}, {order.customer_state} - {order.customer_pincode}
              </p>
              <p className="font-medium text-foreground mt-4">
                Phone: {order.customer_phone}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
          <Link to="/account">
            <Button variant="outline" size="lg">
              View All Orders
            </Button>
          </Link>
          <Link to="/products">
            <Button variant="gradient" size="lg">
              Continue Shopping
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default OrderConfirmation;
