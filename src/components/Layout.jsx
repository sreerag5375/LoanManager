import React from 'react';
import BottomNav from './BottomNav';

const Layout = ({ children }) => {
  return (
    <div className="relative min-h-screen pb-20">
      <main>
        {children}
      </main>
      <BottomNav />
    </div>
  );
};

export default Layout;
