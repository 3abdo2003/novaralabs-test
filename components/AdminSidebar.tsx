import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Ticket, LogOut } from 'lucide-react';

const AdminSidebar: React.FC = () => {
  const navItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/admin' },
    { icon: Package, label: 'Inventory', path: '/admin/inventory' },
    { icon: ShoppingCart, label: 'Orders', path: '/admin/orders' },
    { icon: Ticket, label: 'Promo Codes', path: '/admin/promo-codes' },
  ];

  return (
    <div className="w-56 min-h-screen bg-white border-r border-zinc-100 flex flex-col fixed left-0 top-0 z-40">
      <div className="p-6 mb-4">
        <img src="/logo.png" alt="Novara Labs" className="h-8 w-auto" />
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-300 mt-4">Admin Console</p>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-semibold uppercase tracking-wider transition-all ${
                isActive
                  ? 'bg-zinc-900 text-white shadow-md'
                  : 'text-zinc-400 hover:bg-zinc-50 hover:text-zinc-900'
              }`
            }
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <button 
          onClick={() => window.location.href = '/'}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-semibold text-red-500 hover:bg-red-50 transition-colors uppercase tracking-wider"
        >
          <LogOut className="w-4 h-4" />
          Exit Console
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
