import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Leaf, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Toaster } from 'sonner';
import type { Product } from '@shared/types';
import { ProductQuickView } from '@/components/ProductQuickView';
import { CartDrawer } from '@/components/CartDrawer';
import { useCartActions, useCartUi } from '@/hooks/use-cart';
import { OrderConfirmation } from '@/components/OrderConfirmation';
import { SearchParamsWrapper } from '@/components/SearchParamsWrapper';
export function HomePage() {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const { addToCart, isAuthenticated, logout } = useCartActions();
  const { orderId, actions } = useCartUi();
  const { setOrderId } = actions;
  const location = useLocation();
  const handleAddToCart = (product: Product, variantSku: string, quantity: number) => {
    addToCart({ product, variantSku, quantity });
  };
  return (
    <div className="bg-background min-h-screen">
      <a href="#product-grid" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-background focus:text-foreground">Skip to main content</a>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" role="navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2" aria-current={location.pathname === '/' ? 'page' : undefined}>
            <Leaf className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold font-display text-primary">Verdure</h1>
          </Link>
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Button variant="ghost" onClick={logout}><LogOut className="h-4 w-4 mr-2" /> Logout</Button>
            ) : (
              <Button asChild variant="ghost"><Link to="/login"><User className="h-4 w-4 mr-2" /> Login</Link></Button>
            )}
            <ThemeToggle className="relative top-0 right-0" />
            <CartDrawer />
          </div>
        </div>
      </header>
      <main>
        <section className="relative py-20 md:py-32 bg-secondary/50 overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1973')] bg-cover bg-center opacity-20"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          ></motion.div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-5xl md:text-7xl font-display font-bold text-balance leading-tight">
              Bring Nature <span className="text-gradient">Indoors</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              Discover premium houseplants and accessories to transform your space into a green sanctuary.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="mt-8">
              <Button size="lg" className="btn-gradient" onClick={() => document.getElementById('product-grid')?.scrollIntoView({ behavior: 'smooth' })}>
                Shop All Plants
              </Button>
            </motion.div>
          </div>
        </section>
        <div id="product-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8 md:py-10 lg:py-12">
            <SearchParamsWrapper
              setQuickViewProduct={setQuickViewProduct}
              handleAddToCart={handleAddToCart}
            />
          </div>
        </div>
      </main>
      <footer className="border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Verdure. Built with ❤️ at Cloudflare.</p>
        </div>
      </footer>
      <ProductQuickView
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onOpenChange={(isOpen) => !isOpen && setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
      />
      <OrderConfirmation
        orderId={orderId}
        isOpen={!!orderId}
        onOpenChange={() => setOrderId(null)}
      />
      <Toaster richColors closeButton />
    </div>
  );
}