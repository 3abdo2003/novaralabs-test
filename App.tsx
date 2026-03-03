import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { MessageProvider } from './context/MessageContext';
import { RegionProvider } from './context/RegionContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Peptides from './pages/Peptides';
import PeptideDetail from './pages/PeptideDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import ProductValidation from './pages/ProductValidation';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import CartSidebar from './components/CartSidebar';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const hideChrome = false; // Always show chrome now that home is live

  return (
    <div className="min-h-screen bg-white">
      {!hideChrome && <Navbar />}

      <main>
        {children}
      </main>
      <CartSidebar />

      {!hideChrome && (
        <footer className="bg-zinc-950 text-white py-12 sm:py-20 px-6 sm:px-12 mt-12 sm:mt-20">
          <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8 sm:gap-12">
            <div className="space-y-4">
              <div className="flex items-center space-x-4 cursor-pointer" onClick={() => window.location.href = '/'}>
                <img src="/logo.png" alt="Novara Labs" className="h-32 w-auto invert brightness-0" />
              </div>
              <p className="text-white/40 max-w-xs text-sm">Providing industry-leading research compounds with quality and precision.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 sm:gap-12">
              <div className="space-y-4">
                <h4 className="font-bold text-xs tracking-widest uppercase">Products</h4>
                <ul className="text-sm text-white/50 space-y-2">
                  <li><a href="/peptides" className="hover:text-white">All Peptides</a></li>
                  <li><a href="#" className="hover:text-white">New Arrivals</a></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-bold text-xs tracking-widest uppercase">Support</h4>
                <ul className="text-sm text-white/50 space-y-2">
                  <li><a href="#" className="hover:text-white">Shipping</a></li>
                  <li><a href="/validate" className="hover:text-white">COA Database</a></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-bold text-xs tracking-widest uppercase">Legal</h4>
                <ul className="text-sm text-white/50 space-y-2">
                  <li><a href="#" className="hover:text-white">Terms</a></li>
                  <li><a href="#" className="hover:text-white">Privacy</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="max-w-screen-2xl mx-auto mt-12 sm:mt-20 pt-6 sm:pt-8 border-t border-white/10 text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] flex flex-col sm:flex-row justify-between items-center sm:items-end gap-4 text-center sm:text-left">
            <div className="flex flex-col gap-1">
              <span>© 2026 Novara Labs Research Group</span>
              <span className="opacity-60">Warsaw, Poland</span>
            </div>
            <span className="opacity-60">Europe Based Lab</span>
          </div>
        </footer>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <MessageProvider>
        <RegionProvider>
          <CartProvider>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/peptides" element={<Peptides />} />
                <Route path="/peptides/:slug" element={<PeptideDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/validate" element={<ProductValidation />} />
              </Routes>
            </Layout>
          </CartProvider>
        </RegionProvider>
      </MessageProvider>
    </Router>
  );
};

export default App;
