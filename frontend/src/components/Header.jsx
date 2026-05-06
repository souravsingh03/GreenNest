import React, { useState, useEffect } from "react";

export default function Header({ cartCount, user, onLogout, onCartClick, onOrdersClick, page, onHome, onLoginClick, onSignupClick }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Scroll to a section by ID — works whether on home page or not
  const scrollTo = (id, e) => {
    e.preventDefault();
    setMobileOpen(false);
    // If not on home, go home first then scroll
    if (page !== 'home') { onHome(); setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior:'smooth', block:'start' }), 350); return; }
    document.getElementById(id)?.scrollIntoView({ behavior:'smooth', block:'start' });
  };

  return (
    <header style={{ boxShadow: scrolled ? '0 2px 20px rgba(26,60,43,.12)' : 'none', position:'sticky', top:0, zIndex:200, background:'rgba(250,247,242,.97)', backdropFilter:'blur(12px)', borderBottom:'1px solid var(--border)', transition:'box-shadow .3s' }}>
      <div className="container">
        <div className="header-content">

          {/* Logo */}
          <div className="logo">
            <h1 style={{ fontSize:'1.3rem', margin:0 }}>
              <a href="#" onClick={e => { e.preventDefault(); setMobileOpen(false); onHome(); }}
                style={{ display:'flex', alignItems:'center', gap:8, textDecoration:'none', color:'var(--g-deep)' }}>
                <img src="/images/logo.png" alt="GreenNest" style={{ height:36, borderRadius:'50%' }} />
                <span style={{ fontFamily:"'Playfair Display',serif", fontWeight:700 }}>GreenNest</span>
              </a>
            </h1>
          </div>

          {/* Desktop Nav */}
          <nav style={{ display:'flex', alignItems:'center' }}>
            <ul style={{ display:'flex', listStyle:'none', gap:4, margin:0, padding:0 }}>
              <li>
                <a href="#" onClick={e => { e.preventDefault(); setMobileOpen(false); onHome(); }}
                  className={page === 'home' ? 'nav-active' : ''}>
                  Home
                </a>
              </li>
              <li>
                <a href="#indoor-plant" onClick={e => scrollTo('indoor-plant', e)}>
                  Indoor Plants
                </a>
              </li>
              <li>
                <a href="#outdoor-plant" onClick={e => scrollTo('outdoor-plant', e)}>
                  Outdoor Plants
                </a>
              </li>
              <li>
                <a href="#gardening-tool" onClick={e => scrollTo('gardening-tool', e)}>
                  Tools
                </a>
              </li>
              {user && (
                <li>
                  <a href="#" onClick={e => { e.preventDefault(); setMobileOpen(false); onOrdersClick(); }}
                    className={page === 'orders' ? 'nav-active' : ''}>
                    My Orders
                  </a>
                </li>
              )}
              <li>
                <a href="#contact" onClick={e => scrollTo('contact', e)}>
                  Contact
                </a>
              </li>
            </ul>
          </nav>

          {/* Right side buttons */}
          <div className="header-right">
            {/* Cart */}
            <button className="cart-btn" onClick={onCartClick}>
              🛒 Basket
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>

            {user ? (
              <>
                <span className="user-chip">Hi, {user.name.split(' ')[0]} </span>
                <button className="btn btn-outline btn-sm" onClick={onLogout}>Logout</button>
              </>
            ) : (
              <>
                {/* Login — scrolls up to hero form and switches to login mode */}
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    if (page !== 'home') { onHome(); setTimeout(() => { window.scrollTo({ top:0, behavior:'smooth' }); if (onLoginClick) onLoginClick(); }, 350); return; }
                    window.scrollTo({ top:0, behavior:'smooth' });
                    if (onLoginClick) onLoginClick();
                  }}
                >
                  Login
                </button>
                {/* Sign up — scrolls up to hero form (signup mode) */}
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    if (page !== 'home') { onHome(); setTimeout(() => { window.scrollTo({ top:0, behavior:'smooth' }); if (onSignupClick) onSignupClick(); }, 350); return; }
                    window.scrollTo({ top:0, behavior:'smooth' });
                    if (onSignupClick) onSignupClick();
                  }}
                >
                  Sign up
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
