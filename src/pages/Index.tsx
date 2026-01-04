import React from 'react';
import Layout from '@/components/layout/Layout';
import HeroSection from '@/components/home/HeroSection';
import CategoriesSection from '@/components/home/CategoriesSection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import TrendingProducts from '@/components/home/TrendingProducts';
import FeaturesSection from '@/components/home/FeaturesSection';

const Index: React.FC = () => {
  return (
    <Layout>
      <HeroSection />
      <FeaturesSection />
      <CategoriesSection />
      <FeaturedProducts />
      <TrendingProducts />
    </Layout>
  );
};

export default Index;
