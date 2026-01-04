import React from 'react';
import { Link } from 'react-router-dom';
import { Package, MapPin, User as UserIcon } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useUserOrders } from '@/hooks/useOrders';

const Account: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { data: orders = [], isLoading } = useUserOrders();

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email || '';

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="font-heading text-3xl font-bold mb-4">Please Login</h1>
          <Link to="/login"><Button variant="gradient">Login</Button></Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="font-heading text-3xl font-bold mb-8">My Account</h1>
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card rounded-2xl p-6 shadow-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
              <UserIcon className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <p className="font-semibold">{userName}</p>
              <p className="text-sm text-muted-foreground">{userEmail}</p>
            </div>
          </div>
          <div className="bg-card rounded-2xl p-6 shadow-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
              <Package className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{orders.length}</p>
              <p className="text-sm text-muted-foreground">Total Orders</p>
            </div>
          </div>
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <Button variant="outline" onClick={logout} className="w-full">Logout</Button>
          </div>
        </div>

        <h2 className="font-heading text-2xl font-bold mb-4">My Orders</h2>
        {orders.length === 0 ? (
          <div className="bg-card rounded-2xl p-8 text-center shadow-card">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No orders yet</p>
            <Link to="/products"><Button variant="gradient">Start Shopping</Button></Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link key={order.id} to={`/order-confirmation/${order.id}`} className="block bg-card rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-semibold">Order #{order.order_number}</p>
                    <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary capitalize">{order.status}</span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {order.items.slice(0, 3).map((item, index) => (
                    <img key={index} src={item.product_image} alt="" className="w-16 h-16 rounded-lg object-cover" />
                  ))}
                  {order.items.length > 3 && <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center text-sm">+{order.items.length - 3}</div>}
                </div>
                {/* Hide price for embroidery orders */}
                {order.items.some(item => item.customization) ? (
                  <p className="text-right font-bold mt-4 text-purple-600">Price to be quoted</p>
                ) : (
                  <p className="text-right font-bold mt-4">₹{order.total.toLocaleString()}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Account;
