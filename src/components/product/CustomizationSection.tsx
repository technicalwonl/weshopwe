import React, { useState } from 'react';
import { Upload, X, Palette, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

interface CustomizationSectionProps {
  onSubmitCustomization: (customization: {
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
  }) => void;
  isLoading?: boolean;
}

const CustomizationSection: React.FC<CustomizationSectionProps> = ({ 
  onSubmitCustomization, 
  isLoading = false 
}) => {
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [customText, setCustomText] = useState('');
  const [userDetails, setUserDetails] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    street: '',
    pincode: ''
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setCustomImage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userDetails.name || !userDetails.email || !userDetails.phone || 
        !userDetails.address || !userDetails.street || !userDetails.pincode) {
      alert('Please fill in all your contact and address details');
      return;
    }

    if (!customText && !customImage) {
      alert('Please add either a custom image or text for embroidery');
      return;
    }

    onSubmitCustomization({
      image: customImage,
      text: customText,
      userContact: userDetails
    });
  };

  return (
    <div className="bg-card p-6 rounded-2xl border border-border/50 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <Palette className="h-6 w-6 text-primary" />
        <h3 className="font-heading text-xl font-bold">Customize Your Embroidery</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Your Contact Details */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <span className="text-primary">1.</span> Your Contact Details
          </h4>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name *</label>
              <Input
                value={userDetails.name}
                onChange={(e) => setUserDetails(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your full name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Email Address *</label>
              <Input
                type="email"
                value={userDetails.email}
                onChange={(e) => setUserDetails(prev => ({ ...prev, email: e.target.value }))}
                placeholder="your@email.com"
                required
              />
            </div>
            
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-2">Phone Number *</label>
              <Input
                type="tel"
                value={userDetails.phone}
                onChange={(e) => setUserDetails(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+1 (555) 123-4567"
                required
              />
            </div>
          </div>

          {/* Address Fields */}
          <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium mb-2">Address *</label>
              <Input
                value={userDetails.address}
                onChange={(e) => setUserDetails(prev => ({ ...prev, address: e.target.value }))}
                placeholder="123 Main Street, Apartment 4B"
                required
              />
            </div>
            
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium mb-2">Street/Area *</label>
              <Input
                value={userDetails.street}
                onChange={(e) => setUserDetails(prev => ({ ...prev, street: e.target.value }))}
                placeholder="Near Landmark, Colony Name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Pincode *</label>
              <Input
                value={userDetails.pincode}
                onChange={(e) => setUserDetails(prev => ({ ...prev, pincode: e.target.value }))}
                placeholder="110001"
                pattern="[0-9]{6}"
                maxLength={6}
                required
              />
            </div>
          </div>
        </div>

        {/* Custom Image Upload */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <span className="text-primary">2.</span> Upload Custom Image (Optional)
          </h4>
          
          <div className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="custom-image-upload"
              />
              
              {!customImage ? (
                <div>
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload an image for embroidery design
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('custom-image-upload')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Image
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <img
                    src={customImage}
                    alt="Custom embroidery design"
                    className="max-w-full h-48 mx-auto object-contain rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove Image
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Custom Text */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Type className="h-4 w-4" />
            <span className="text-primary">3.</span> Custom Text for Embroidery
          </h4>
          
          <Textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Enter the text you want embroidered on the product (e.g., names, dates, quotes)..."
            className="min-h-[100px]"
            maxLength={200}
          />
          <p className="text-xs text-muted-foreground">
            Maximum 200 characters. This text will be embroidered exactly as written.
          </p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Submitting...' : 'Submit Customization Request'}
        </Button>

        <div className="bg-muted/50 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> This is a custom embroidery order. Our team will review your design and contact you within 24-48 hours to confirm details and pricing before proceeding with your order.
          </p>
        </div>
      </form>
    </div>
  );
};

export default CustomizationSection;
