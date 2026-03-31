import React, { ReactNode } from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import Chatbot from '../common/Chatbot';

interface LayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showFooter = true }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        {children}
      </main>
      {showFooter && <Footer />}
      <Chatbot />
    </div>
  );
};

export default Layout;