import React from 'react';

// Layout used by individual pages. Header is provided by the higher-level
// MainLayout (so we avoid rendering the header twice). This component
// therefore only renders the page's main content wrapper.
const Layout = ({ children }) => {
  return (
    <div className="app-layout">
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
