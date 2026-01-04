import React, { useMemo, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  BarChart3,
  Boxes,
  Clock,
  Palette
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { useAllProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useOrders } from '@/hooks/useOrders';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useCustomizationOrders, subscribeToOrderUpdates } from '@/hooks/useCustomizationOrders';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { cn } from '@/lib/utils';

const AdminDashboard: React.FC = () => {
  const { data: products = [] } = useAllProducts();
  const { data: categories = [] } = useCategories();
  const { data: orders = [] } = useOrders();
  const { data: users = [] } = useUserRoles();
  const { data: customizationOrders = [] } = useCustomizationOrders();
  const [customOrderCount, setCustomOrderCount] = useState(customizationOrders.length);

  // Real-time updates for customization orders
  useEffect(() => {
    const unsubscribe = subscribeToOrderUpdates(() => {
      setCustomOrderCount(customizationOrders.length);
    });

    return unsubscribe;
  }, [customizationOrders.length]);

  // Calculate stats
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = orders.filter(o => o.status === 'placed' || o.status === 'packed').length;
  const completedOrders = orders.filter(o => o.status === 'delivered').length;
  const lowStockProducts = products.filter(p => (p.stock ?? 0) < 10).length;

  // Generate revenue data for chart (last 7 days)
  const revenueChartData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const data = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      
      const dayOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate.toDateString() === date.toDateString();
      });
      
      const dayRevenue = dayOrders.reduce((sum, order) => sum + order.total, 0);
      const orderCount = dayOrders.length;
      
      data.push({
        name: dayName,
        revenue: dayRevenue,
        orders: orderCount
      });
    }
    
    return data;
  }, [orders]);

  // Order status distribution
  const orderStatusData = useMemo(() => {
    const statusCounts = {
      placed: orders.filter(o => o.status === 'placed').length,
      packed: orders.filter(o => o.status === 'packed').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
    };

    return Object.entries(statusCounts)
      .filter(([_, value]) => value > 0)
      .map(([status, value]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value,
      }));
  }, [orders]);

  // Category wise products
  const categoryData = useMemo(() => {
    return categories.slice(0, 5).map(cat => ({
      name: cat.name,
      products: products.filter(p => p.category_id === cat.id || p.category === cat.name).length,
    }));
  }, [categories, products]);

  const COLORS = ['#f97316', '#3b82f6', '#22c55e', '#a855f7', '#ef4444'];

  const stats = [
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-green-500',
      trend: '+12%',
      trendUp: true,
    },
    {
      title: 'Total Orders',
      value: orders.length,
      icon: ShoppingCart,
      color: 'bg-blue-500',
      trend: '+8%',
      trendUp: true,
    },
    {
      title: 'Total Products',
      value: products.length,
      icon: Package,
      color: 'bg-purple-500',
      trend: '+5%',
      trendUp: true,
    },
    {
      title: 'Team Members',
      value: users.length,
      icon: Users,
    },
  ];

  const quickStats = [
    {
      title: 'Pending Orders',
      value: pendingOrders,
      icon: Clock,
      color: 'text-yellow-600 bg-yellow-100',
      link: '/admin/orders',
    },
    {
      title: 'Completed Orders',
      value: completedOrders,
      icon: TrendingUp,
      color: 'text-green-600 bg-green-100',
      link: '/admin/orders',
    },
    {
      title: 'Customization Orders',
      value: customOrderCount,
      icon: Palette,
      color: 'text-purple-600 bg-purple-100',
      link: '/admin/customization-orders',
    },
    {
      title: 'Low Stock Items',
      value: lowStockProducts,
      icon: AlertTriangle,
      color: 'text-red-600 bg-red-100',
      link: '/admin/products',
    },
    {
      title: 'Team Members',
      value: users.length,
      icon: Users,
      color: 'text-orange-600 bg-orange-100',
      link: '/admin/team',
    },
  ];

  const recentOrders = orders.slice(0, 5);

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back! Here's your store overview.</p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/products">
              <Button variant="outline" className="gap-2">
                <Package className="h-4 w-4" />
                Add Product
              </Button>
            </Link>
            <Link to="/admin/orders">
              <Button variant="gradient" className="gap-2">
                <Eye className="h-4 w-4" />
                View Orders
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <span className={cn(
                  'flex items-center text-sm font-medium',
                  stat.trendUp ? 'text-green-600' : 'text-red-600'
                )}>
                  {stat.trendUp ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  {stat.trend}
                </span>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((stat, index) => (
            <Link
              key={index}
              to={stat.link}
              className="bg-card rounded-xl p-4 shadow-card hover:shadow-card-hover transition-all flex items-center gap-4"
            >
              <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.title}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-heading text-xl font-bold">Revenue Overview</h2>
                <p className="text-sm text-muted-foreground">Last 7 days</p>
              </div>
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--primary))" 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Order Status Chart */}
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-heading text-xl font-bold">Order Status</h2>
                <p className="text-sm text-muted-foreground">Distribution</p>
              </div>
            </div>
            <div className="h-64 flex items-center justify-center">
              {orderStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {orderStatusData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No orders yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Category Products Chart */}
        <div className="bg-card rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-heading text-xl font-bold">Products by Category</h2>
              <p className="text-sm text-muted-foreground">Top 5 categories</p>
            </div>
          </div>
          <div className="h-64">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={100} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="products" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Boxes className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No categories yet</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-card rounded-2xl shadow-card overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="font-heading text-xl font-bold">Recent Orders</h2>
            <Link to="/admin/orders">
              <Button variant="ghost" size="sm" className="gap-1">
                View All
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
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
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      No orders yet
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 font-medium">{order.order_number}</td>
                      <td className="px-6 py-4">{order.customer_name}</td>
                      <td className="px-6 py-4">{order.items.length} items</td>
                      <td className="px-6 py-4 font-medium">₹{order.total.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alert */}
        {lowStockProducts > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">Low Stock Alert</p>
                <p className="text-sm text-yellow-700">{lowStockProducts} products have less than 10 items in stock</p>
              </div>
            </div>
            <Link to="/admin/products">
              <Button variant="outline" size="sm">View Products</Button>
            </Link>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;