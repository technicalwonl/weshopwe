import React from 'react';
import Header from './Header';
import Footer from './Footer';
import MobileCartButton from '../cart/MobileCartButton';

interface LayoutProps {
  children: React.ReactNode;
  hideFooter?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, hideFooter = false }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      {!hideFooter && <Footer />}
      <MobileCartButton />
    </div>
  );
};

export default Layout;
