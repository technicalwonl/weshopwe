import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Store, Bell, CreditCard, Truck, Save, Loader2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface StoreSettings {
  storeName: string;
  storeDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  currency: string;
  taxRate: number;
}

interface ShippingSettings {
  freeShippingThreshold: number;
  standardShippingRate: number;
  expressShippingRate: number;
  estimatedDeliveryDays: number;
}

interface NotificationSettings {
  orderConfirmation: boolean;
  orderShipped: boolean;
  orderDelivered: boolean;
  lowStockAlert: boolean;
  lowStockThreshold: number;
}

const AdminSettings: React.FC = () => {
  const [saving, setSaving] = useState(false);
  
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    storeName: 'WE SHOP',
    storeDescription: 'Your premium destination for online shopping',
    contactEmail: 'support@weshop.com',
    contactPhone: '+1 (555) 123-4567',
    address: '123 Shopping Street, Commerce City, 10001',
    currency: 'INR',
    taxRate: 18,
  });

  const [shippingSettings, setShippingSettings] = useState<ShippingSettings>({
    freeShippingThreshold: 999,
    standardShippingRate: 99,
    expressShippingRate: 199,
    estimatedDeliveryDays: 5,
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    orderConfirmation: true,
    orderShipped: true,
    orderDelivered: true,
    lowStockAlert: true,
    lowStockThreshold: 10,
  });

  const handleSaveStore = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    localStorage.setItem('store_settings', JSON.stringify(storeSettings));
    toast.success('Store settings saved');
    setSaving(false);
  };

  const handleSaveShipping = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    localStorage.setItem('shipping_settings', JSON.stringify(shippingSettings));
    toast.success('Shipping settings saved');
    setSaving(false);
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    localStorage.setItem('notification_settings', JSON.stringify(notificationSettings));
    toast.success('Notification settings saved');
    setSaving(false);
  };

  useEffect(() => {
    try {
      const storedStore = localStorage.getItem('store_settings');
      if (storedStore) setStoreSettings(JSON.parse(storedStore));
      
      const storedShipping = localStorage.getItem('shipping_settings');
      if (storedShipping) setShippingSettings(JSON.parse(storedShipping));
      
      const storedNotifications = localStorage.getItem('notification_settings');
      if (storedNotifications) setNotificationSettings(JSON.parse(storedNotifications));
    } catch (e) {
      console.error('Failed to load settings', e);
    }
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">Configure your store settings</p>
        </div>

        <Tabs defaultValue="store" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-xl">
            <TabsTrigger value="store" className="gap-2">
              <Store className="h-4 w-4" />
              <span className="hidden sm:inline">Store</span>
            </TabsTrigger>
            <TabsTrigger value="shipping" className="gap-2">
              <Truck className="h-4 w-4" />
              <span className="hidden sm:inline">Shipping</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Payments</span>
            </TabsTrigger>
          </TabsList>

          {/* Store Settings */}
          <TabsContent value="store">
            <div className="bg-card rounded-2xl p-6 shadow-card space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                  <Store className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="font-heading text-xl font-bold">Store Information</h2>
                  <p className="text-sm text-muted-foreground">Basic information about your store</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Store Name</Label>
                  <Input 
                    value={storeSettings.storeName}
                    onChange={(e) => setStoreSettings({...storeSettings, storeName: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Store Description</Label>
                  <Textarea 
                    value={storeSettings.storeDescription}
                    onChange={(e) => setStoreSettings({...storeSettings, storeDescription: e.target.value})}
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Contact Email</Label>
                  <Input 
                    type="email"
                    value={storeSettings.contactEmail}
                    onChange={(e) => setStoreSettings({...storeSettings, contactEmail: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Contact Phone</Label>
                  <Input 
                    value={storeSettings.contactPhone}
                    onChange={(e) => setStoreSettings({...storeSettings, contactPhone: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Store Address</Label>
                  <Input 
                    value={storeSettings.address}
                    onChange={(e) => setStoreSettings({...storeSettings, address: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Currency</Label>
                  <Input 
                    value={storeSettings.currency}
                    onChange={(e) => setStoreSettings({...storeSettings, currency: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Tax Rate (%)</Label>
                  <Input 
                    type="number"
                    value={storeSettings.taxRate}
                    onChange={(e) => setStoreSettings({...storeSettings, taxRate: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button onClick={handleSaveStore} disabled={saving} className="gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Shipping Settings */}
          <TabsContent value="shipping">
            <div className="bg-card rounded-2xl p-6 shadow-card space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center">
                  <Truck className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="font-heading text-xl font-bold">Shipping Configuration</h2>
                  <p className="text-sm text-muted-foreground">Set up shipping rates and policies</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Free Shipping Threshold (₹)</Label>
                  <Input 
                    type="number"
                    value={shippingSettings.freeShippingThreshold}
                    onChange={(e) => setShippingSettings({...shippingSettings, freeShippingThreshold: Number(e.target.value)})}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Orders above this amount get free shipping</p>
                </div>
                <div>
                  <Label>Standard Shipping Rate (₹)</Label>
                  <Input 
                    type="number"
                    value={shippingSettings.standardShippingRate}
                    onChange={(e) => setShippingSettings({...shippingSettings, standardShippingRate: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label>Express Shipping Rate (₹)</Label>
                  <Input 
                    type="number"
                    value={shippingSettings.expressShippingRate}
                    onChange={(e) => setShippingSettings({...shippingSettings, expressShippingRate: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label>Estimated Delivery Days</Label>
                  <Input 
                    type="number"
                    value={shippingSettings.estimatedDeliveryDays}
                    onChange={(e) => setShippingSettings({...shippingSettings, estimatedDeliveryDays: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button onClick={handleSaveShipping} disabled={saving} className="gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <div className="bg-card rounded-2xl p-6 shadow-card space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-yellow-500 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="font-heading text-xl font-bold">Notification Preferences</h2>
                  <p className="text-sm text-muted-foreground">Configure email and alert notifications</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                  <div>
                    <p className="font-medium">Order Confirmation</p>
                    <p className="text-sm text-muted-foreground">Send email when order is placed</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.orderConfirmation}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, orderConfirmation: checked})}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                  <div>
                    <p className="font-medium">Order Shipped</p>
                    <p className="text-sm text-muted-foreground">Notify when order is shipped</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.orderShipped}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, orderShipped: checked})}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                  <div>
                    <p className="font-medium">Order Delivered</p>
                    <p className="text-sm text-muted-foreground">Notify when order is delivered</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.orderDelivered}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, orderDelivered: checked})}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                  <div>
                    <p className="font-medium">Low Stock Alert</p>
                    <p className="text-sm text-muted-foreground">Alert when product stock is low</p>
                  </div>
                  <Switch 
                    checked={notificationSettings.lowStockAlert}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, lowStockAlert: checked})}
                  />
                </div>
                {notificationSettings.lowStockAlert && (
                  <div className="pl-4">
                    <Label>Low Stock Threshold</Label>
                    <Input 
                      type="number"
                      value={notificationSettings.lowStockThreshold}
                      onChange={(e) => setNotificationSettings({...notificationSettings, lowStockThreshold: Number(e.target.value)})}
                      className="max-w-xs"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button onClick={handleSaveNotifications} disabled={saving} className="gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Payment Settings */}
          <TabsContent value="payments">
            <div className="bg-card rounded-2xl p-6 shadow-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="font-heading text-xl font-bold">Payment Configuration</h2>
                  <p className="text-sm text-muted-foreground">Configure payment methods</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-6 bg-muted/50 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-heading font-bold">Pay on Delivery</p>
                      <p className="text-sm text-muted-foreground">Service manager contacts customer for payment</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Active</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your service manager will contact customers for payment collection upon delivery.
                    This is the default payment method for your store.
                  </p>
                </div>

                <div className="p-6 bg-muted/30 rounded-xl border-2 border-dashed">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-heading font-bold text-muted-foreground">Online Payments</p>
                      <p className="text-sm text-muted-foreground">Accept cards, UPI, and wallets</p>
                    </div>
                    <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm font-medium">Coming Soon</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Integration with payment gateways like Razorpay, Stripe, and PayPal will be available soon.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
