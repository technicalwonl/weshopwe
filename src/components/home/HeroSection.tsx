import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden gradient-hero">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/4 w-[600px] h-[600px] rounded-full bg-secondary/5 blur-3xl" />
      </div>

      <div className="container relative">
        <div className="min-h-[70vh] md:min-h-[80vh] flex items-center py-12 md:py-20">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center w-full">
            {/* Content */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
                ✨ New Collection 2026 - Live Now
              </span>
              
              <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6 animate-fade-in stagger-1">
                Discover Your 
                <span className="block gradient-text">Perfect Crafting Style</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8 animate-fade-in stagger-2">
                Explore our handpicked selection of premium craft supplies and unique creations. From vibrant fabrics to top-tier tools, find everything you need to bring your artistic vision to life—at prices that make creativity even more exciting!
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in stagger-3">
                <Link to="/products">
                  <Button variant="hero" size="xl" className="w-full sm:w-auto">
                    Shop Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/products?trending=true">
                  <Button variant="outline-primary" size="xl" className="w-full sm:w-auto">
                    Explore Trending
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-center lg:justify-start gap-8 mt-12 animate-fade-in stagger-4">
                <div>
                  <p className="text-2xl md:text-3xl font-bold text-foreground"></p>
                  <p className="text-sm text-muted-foreground"></p>
                </div>
                <div className="w-px h-12 bg-border" />
                <div>
                  <p className="text-2xl md:text-3xl font-bold text-foreground"></p>
                  <p className="text-sm text-muted-foreground"></p>
                </div>
                <div className="w-px h-12 bg-border" />
                <div>
                  <p className="text-2xl md:text-3xl font-bold text-foreground"></p>
                  <p className="text-sm text-muted-foreground"></p>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative order-1 lg:order-2 animate-fade-in">
              <div className="relative z-10">
                <img
                  src="https://wallpapers.com/images/hd/craft-background-1920-x-1080-obdo1po44uz8e6fz.jpg"
                  alt="Premium Shopping Experience"
                  className="w-full max-w-lg mx-auto rounded-3xl shadow-card-hover animate-float"
                />
              </div>
              {/* Floating Elements */}
              <div className="absolute bottom-10 -left-4 left-2 md:left-0 bg-card p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-card animate-fade-in stagger-2">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                    <span className="text-lg sm:text-2xl">🚀</span>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium">Fast Delivery</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">2-3 Days</p>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-10 -right-20 right-2 md:right-0 bg-card p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-card animate-fade-in stagger-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-lg sm:text-2xl">💎</span>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium">Premium Quality</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">100% Genuine</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
