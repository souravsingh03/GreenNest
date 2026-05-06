import React, { useState, useEffect, useCallback, useRef } from "react";
import Header             from "./Header";
import HeroSection        from "./HeroSection";
import FilterBar          from "./FilterBar";
import ShopSection        from "./ShopSection";
import CartDrawer         from "./CartDrawer";
import CheckoutPage       from "./CheckoutPage";
import OrderSuccess       from "./OrderSuccess";
import OrdersPage         from "./OrdersPage";
import TestimonialSection from "./TestimonialSection";
import Footer             from "./Footer";

const BASE = 'http://localhost:8080/api';

export default function App() {
  const [user, setUser]           = useState(null);
  const [page, setPage]           = useState('home');
  const [cart, setCart]           = useState({ items:[], totalItems:0, totalPrice:0, isEmpty:true });
  const [cartOpen, setCartOpen]   = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [toasts, setToasts]       = useState([]);
  const [filter, setFilter]       = useState({ category:'ALL', keyword:'', sortBy:'newest', minPrice:'', maxPrice:'', inStockOnly:false });
  const [showBackTop, setShowBackTop] = useState(false);
  const [checkoutCoupon, setCheckoutCoupon]     = useState('');
  const [checkoutDiscount, setCheckoutDiscount] = useState(null);
  // Controls which mode the hero form is in (login/signup)
  const heroModeRef = useRef(null); // holds a setter from HeroSection

  const getToken = () => localStorage.getItem('gn_token');

  const apiFetch = useCallback(async (path, opts = {}) => {
    const t = getToken();
    const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
    if (t) headers['Authorization'] = `Bearer ${t}`;
    const res  = await fetch(`${BASE}${path}`, { ...opts, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || 'Request failed');
    return data;
  }, []);

  const toast = useCallback((msg, type = 'ok') => {
    const id = Date.now() + Math.random();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);

  const refreshCart = useCallback(async () => {
    if (!getToken()) { setCart({ items:[], totalItems:0, totalPrice:0, isEmpty:true }); return; }
    try { const data = await apiFetch('/cart'); setCart(data); } catch {}
  }, [apiFetch]);

  useEffect(() => {
    try { const u = localStorage.getItem('gn_user'); if (u) setUser(JSON.parse(u)); } catch {}
    refreshCart();
    const onScroll = () => setShowBackTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [refreshCart]);

  const handleAuth = (userData) => {
    setUser(userData);
    toast(`Welcome, ${userData.name.split(' ')[0]}! `);
    refreshCart();
  };

  const handleLogout = () => {
    localStorage.removeItem('gn_token');
    localStorage.removeItem('gn_user');
    setUser(null);
    setCart({ items:[], totalItems:0, totalPrice:0, isEmpty:true });
    setCheckoutCoupon(''); setCheckoutDiscount(null);
    toast('Logged out successfully.');
  };

  const addToCart = async (productId) => {
    if (!getToken()) { toast('Please sign in to add items to basket '); return; }
    try {
      await apiFetch('/cart/add', { method:'POST', body: JSON.stringify({ productId, quantity:1 }) });
      await refreshCart();
    } catch (e) { toast(e.message, 'err'); throw e; }
  };

  const updateQty = async (cartItemId, quantity) => {
    try {
      await apiFetch(`/cart/update/${cartItemId}`, { method:'PUT', body: JSON.stringify({ quantity }) });
      await refreshCart();
    } catch (e) { toast(e.message, 'err'); }
  };

  const removeItem = async (cartItemId) => {
    try {
      await apiFetch(`/cart/remove/${cartItemId}`, { method:'DELETE' });
      await refreshCart();
      toast('Item removed from basket');
    } catch (e) { toast(e.message, 'err'); }
  };

  const placeOrder = async (checkoutData) => {
    const data = await apiFetch('/orders/checkout', { method:'POST', body: JSON.stringify(checkoutData) });
    setLastOrder(data);
    await refreshCart();
    setCheckoutCoupon(''); setCheckoutDiscount(null);
    goTo('success');
  };

  const goTo = (p) => { setPage(p); window.scrollTo(0, 0); };

  const handleProceedToCheckout = (coupon, discount) => {
    if (!user)                             { toast('Please sign in to checkout'); return; }
    if (!cart.items || !cart.items.length) { toast('Your cart is empty'); return; }
    setCheckoutCoupon(coupon   || '');
    setCheckoutDiscount(discount || null);
    setCartOpen(false);
    setTimeout(() => goTo('checkout'), 320);
  };

  const isHome = page === 'home' || page === 'orders';

  return (
    <>
      <Header
        cartCount={cart.totalItems || 0}
        user={user}
        onLogout={handleLogout}
        onCartClick={() => { if (page !== 'checkout') setCartOpen(true); }}
        onOrdersClick={() => { user ? goTo('orders') : toast('Please sign in first'); }}
        page={page}
        onHome={() => goTo('home')}
        onLoginClick={() => { if (heroModeRef.current) heroModeRef.current('login'); }}
        onSignupClick={() => { if (heroModeRef.current) heroModeRef.current('signup'); }}
      />

      {page === 'home' && (
        <>
          {!user
            ? <HeroSection onAuth={handleAuth} modeRef={heroModeRef} />
            : (
              <div className="hero-logged-in">
                <div className="container">
                  <h2 style={{ fontFamily:"'Playfair Display',serif", color:'#1a3c2b', fontSize:'1.5rem' }}>
                    Welcome back, {user.name.split(' ')[0]}!
                  </h2>
                  <p style={{ color:'#4a4a4a', marginTop:4, fontSize:'.9rem' }}>
                    Browse and shop from our fresh collection below.
                  </p>
                </div>
              </div>
            )
          }
          <FilterBar filter={filter} onChange={setFilter} />
          <ShopSection filter={filter} onAddToCart={addToCart} toast={toast} user={user} />
          <TestimonialSection />
        </>
      )}

      {page === 'checkout' && (
        <CheckoutPage
          cart={cart} user={user}
          onPlaceOrder={placeOrder}
          onBack={() => { goTo('home'); setTimeout(() => setCartOpen(true), 100); }}
          apiFetch={apiFetch} toast={toast}
          initialCoupon={checkoutCoupon}
          initialDiscount={checkoutDiscount}
        />
      )}

      {page === 'success' && (
        <OrderSuccess order={lastOrder} onContinue={() => goTo('home')} onViewOrders={() => goTo('orders')} />
      )}

      {page === 'orders' && (
        <OrdersPage apiFetch={apiFetch} onBack={() => goTo('home')} />
      )}

      {page !== 'checkout' && page !== 'success' && <Footer />}

      {isHome && (
        <CartDrawer
          open={cartOpen} onClose={() => setCartOpen(false)}
          cart={cart} onUpdateQty={updateQty} onRemove={removeItem}
          onCheckout={handleProceedToCheckout}
          apiFetch={apiFetch} refreshCart={refreshCart} toast={toast}
        />
      )}

      <button className={`back-top ${showBackTop ? 'visible' : ''}`}
        onClick={() => window.scrollTo({ top:0, behavior:'smooth' })}>↑</button>

      <div className="toast-wrap">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type === 'err' ? 'err' : ''}`}>
            {t.type === 'err' ? '⚠️' : '🌿'} {t.msg}
          </div>
        ))}
      </div>
    </>
  );
}
