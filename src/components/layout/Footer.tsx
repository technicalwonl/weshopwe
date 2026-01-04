import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-block mb-4">
              <span className="font-heading text-2xl font-bold text-background">
                WE SHOP
              </span>
            </Link>
            <p className="text-background/70 text-sm leading-relaxed mb-6">
              Your premium destination for online shopping. Discover trending products, exclusive deals, and fast delivery.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/products" className="text-background/70 hover:text-background text-sm transition-colors">
                  All Products

                </Link>
              </li>
              <li>
                <Link to="/products?trending=true" className="text-background/70 hover:text-background text-sm transition-colors">
                  Trending Now
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-heading text-lg font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/account" className="text-background/70 hover:text-background text-sm transition-colors">
                  My Account
                </Link>
              </li>
              <li>
                <Link to="/account" className="text-background/70 hover:text-background text-sm transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <a href="#" className="text-background/70 hover:text-background text-sm transition-colors">
                  Shipping Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-background/70 hover:text-background text-sm transition-colors">
                  Returns & Refunds
                </a>
              </li>
              <li>
                <a href="#" className="text-background/70 hover:text-background text-sm transition-colors">
                  FAQs
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-heading text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 mt-0.5 text-primary" />
                <span className="text-background/70 text-sm">
                  online
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary" />
                <span className="text-background/70 text-sm">8522804976</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <span className="text-background/70 text-sm">writtenexpressa1206@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-background/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-background/60 text-sm">
              © 2026 WE SHOP. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-background/60 hover:text-background text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-background/60 hover:text-background text-sm transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
