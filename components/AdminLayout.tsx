import React from 'react';
import AdminSidebar from './AdminSidebar';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-zinc-50/50">
      <AdminSidebar />
      <main className="lg:pl-64 pt-16 lg:pt-0 min-h-screen">
        <div className="max-w-screen-xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
