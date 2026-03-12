import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Ticket, LogOut, Menu, X, ShieldAlert, QrCode } from 'lucide-react';

const AdminSidebar: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const navItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/admin' },
    { icon: Package, label: 'Inventory', path: '/admin/inventory' },
    { icon: QrCode, label: 'QR Verification', path: '/admin/qrcodes' },
    { icon: ShoppingCart, label: 'Orders', path: '/admin/orders' },
    { icon: Ticket, label: 'Promo Codes', path: '/admin/promo-codes' },
    { icon: ShieldAlert, label: 'Settings', path: '/admin/settings' },
  ];

  return (
    <>
      {/* Mobile Toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-zinc-100 flex items-center justify-between px-6 z-[60]">
        <img src="/logo.png" alt="Novara Labs" className="h-6 w-auto" />
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-zinc-900"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-zinc-100 flex flex-col transition-transform duration-300 lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 mb-4 hidden lg:block">
          <img src="/logo.png" alt="Novara Labs" className="h-8 w-auto" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-300 mt-4">Admin Console</p>
        </div>

        <div className="p-8 mb-4 lg:hidden">
            {/* Mobile Header in Sidebar if needed, otherwise just spacer */}
            <div className="h-8" />
        </div>

        <nav className="flex-1 px-4 space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all ${
                  isActive
                    ? 'bg-zinc-900 text-white shadow-xl shadow-zinc-200'
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
            className="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-[11px] font-black text-red-500 hover:bg-red-50 transition-colors uppercase tracking-wider"
          >
            <LogOut className="w-4 h-4" />
            Exit Console
          </button>
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default AdminSidebar;
