import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, Globe, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRegion } from '../context/RegionContext';
import { useCart } from '../context/CartContext';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { region, setRegion } = useRegion();
  const { itemCount, openCart } = useCart();

  // Close menu on navigation
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Lock scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isMenuOpen]);

  const navLinks = [
    { name: 'Peptides', path: '/peptides' },
    { name: 'Validation', path: '/validate' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] px-4 py-3 sm:px-6 lg:px-12 lg:py-6">
      <div className="max-w-screen-2xl mx-auto">
        <div className="relative bg-white/80 backdrop-blur-xl border border-white/20 rounded-[1.5rem] lg:rounded-[2.5rem] shadow-2xl shadow-black/5 px-4 lg:px-10 py-2 lg:py-4 flex items-center justify-between transition-all duration-500 hover:shadow-black/10">
          <Link to="/" className="flex items-center -ml-2 lg:ml-0 overflow-hidden">
            <img src="/logo.png" alt="Novara Labs" className="h-10 sm:h-12 lg:h-24 w-auto object-contain scale-[1.2] lg:scale-[1.3]" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-10">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-[10px] font-black uppercase tracking-[0.25em] transition-all relative group ${location.pathname === link.path ? 'text-orange-500' : 'text-gray-400 hover:text-black'}`}
              >
                {link.name}
                <span className={`absolute -bottom-2 left-0 h-[3px] bg-orange-500 transition-all duration-300 group-hover:w-full ${location.pathname === link.path ? 'w-full' : 'w-0'}`}></span>
              </Link>
            ))}

            <div className="flex items-center gap-1 p-1 bg-gray-50/50 rounded-full border border-gray-100/50 ml-4 backdrop-blur-sm">
              <button
                type="button"
                onClick={() => setRegion('EG')}
                className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all ${region === 'EG' ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-400 hover:text-black'}`}
              >
                Egypt
              </button>
              <button
                type="button"
                onClick={() => setRegion('WORLDWIDE')}
                className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all ${region === 'WORLDWIDE' ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-400 hover:text-black'}`}
              >
                Worldwide
              </button>
            </div>

            {region === 'EG' && (
              <button
                onClick={openCart}
                className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-zinc-950 text-white hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10 group"
                aria-label="Cart"
              >
                <ShoppingCart className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] font-black rounded-full w-6 h-6 flex items-center justify-center shadow-lg shadow-orange-500/30">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="flex lg:hidden items-center gap-2">
            {region === 'EG' && (
              <button
                onClick={openCart}
                className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 active:scale-95 transition-all"
                aria-label="Cart"
              >
                <ShoppingCart className="w-4 h-4 text-black" />
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>
            )}

            <button
              className={`relative w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-xl transition-all ${isMenuOpen ? 'bg-zinc-900 shadow-lg' : 'bg-gray-50 border border-gray-100'}`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <span className={`block w-5 h-0.5 rounded-full transition-all duration-500 ${isMenuOpen ? 'bg-white rotate-45 translate-y-[4px]' : 'bg-black'}`}></span>
              <span className={`block w-5 h-0.5 rounded-full transition-all duration-300 ${isMenuOpen ? 'opacity-0 scale-x-0' : 'bg-black'}`}></span>
              <span className={`block w-5 h-0.5 rounded-full transition-all duration-500 ${isMenuOpen ? 'bg-white -rotate-45 -translate-y-[4px]' : 'bg-black'}`}></span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[90] lg:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-24 right-4 bottom-4 left-4 sm:left-auto sm:w-[400px] bg-white rounded-[2rem] z-[101] shadow-2xl p-8 lg:hidden flex flex-col overflow-hidden border border-white/20"
            >
              <button
                onClick={() => setIsMenuOpen(false)}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-orange-500 transition-colors"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
              <div className="flex-1 flex flex-col justify-center space-y-2">
                <div className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-6">Navigation</div>
                {navLinks.map((link, idx) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 + 0.2 }}
                  >
                    <Link
                      to={link.path}
                      className={`group flex items-center justify-between py-4 text-2xl font-black uppercase tracking-tighter transition-all ${location.pathname === link.path ? 'text-orange-500' : 'text-black'}`}
                    >
                      <span>{link.name}</span>
                      <ChevronRight className={`w-6 h-6 transition-transform group-hover:translate-x-1 ${location.pathname === link.path ? 'opacity-100' : 'opacity-20'}`} />
                    </Link>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="pt-8 border-t border-gray-100 space-y-6"
              >
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Globe className="w-3 h-3 text-gray-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Select Region</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 p-1.5 bg-gray-50 rounded-2xl border border-gray-100">
                    <button
                      type="button"
                      onClick={() => setRegion('EG')}
                      className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${region === 'EG' ? 'bg-white text-orange-500 shadow-xl' : 'text-gray-400'}`}
                    >
                      Egypt
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegion('WORLDWIDE')}
                      className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${region === 'WORLDWIDE' ? 'bg-white text-orange-500 shadow-xl' : 'text-gray-400'}`}
                    >
                      Worldwide
                    </button>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-orange-500" />
                    Certified Research Solutions
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
