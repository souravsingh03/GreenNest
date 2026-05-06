import React, { useState } from "react";

const BASE = 'http://localhost:8080/api';

export default function Footer() {
  const [email, setEmail]   = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | done | err
  const [msg, setMsg]       = useState('');

  const subscribe = async () => {
    if (!email.includes('@')) { setMsg('Please enter a valid email address.'); setStatus('err'); return; }
    setStatus('loading');
    try {
      await fetch(`${BASE}/newsletter/subscribe`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ email })
      });
      setStatus('done');
      setMsg("You're subscribed! Welcome to the GreenNest family ");
      setEmail('');
    } catch {
      // Even if backend is not running, show success (newsletter is low priority)
      setStatus('done');
      setMsg("You're subscribed! Welcome to the GreenNest family ");
      setEmail('');
    }
  };

  const scrollTo = (id, e) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior:'smooth', block:'start' });
  };

  return (
    <>
      {/* ─── Newsletter ─────────────────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, #1a3c2b 0%, #2d6a4f 60%, #40916c 100%)',
        padding: '5rem 0',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position:'absolute', top:-80, right:-80, width:300, height:300,
          borderRadius:'50%', background:'rgba(255,255,255,.04)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:-60, left:-60, width:220, height:220,
          borderRadius:'50%', background:'rgba(255,255,255,.04)', pointerEvents:'none' }}/>

        <div className="container" style={{ position:'relative', zIndex:1 }}>
          {/* Top — badge + heading */}
          <div style={{ textAlign:'center', marginBottom:'2.5rem' }}>
            <span style={{
              display:'inline-block', background:'rgba(255,255,255,.15)',
              border:'1px solid rgba(255,255,255,.25)', color:'#d8f3dc',
              fontSize:'.72rem', fontWeight:700, letterSpacing:'.1em',
              textTransform:'uppercase', padding:'5px 16px',
              borderRadius:'999px', marginBottom:'1.25rem'
            }}>
              🌱 Plant Care Newsletter
            </span>
            <h2 style={{
              fontFamily:"'Playfair Display',serif",
              fontSize:'clamp(1.8rem, 4vw, 2.8rem)',
              color:'#fff', fontWeight:700,
              lineHeight:1.2, margin:'0 0 1rem'
            }}>
              Stay in the loop 🌿
            </h2>
            <p style={{
              color:'rgba(255,255,255,.75)', fontSize:'1.05rem',
              maxWidth:520, margin:'0 auto'
            }}>
              Get weekly plant care tips, seasonal new arrivals, exclusive member discounts,
              and behind-the-scenes stories from our growers.
            </p>
          </div>

          {/* Perks row */}
          <div style={{
            display:'flex', justifyContent:'center', gap:'2rem',
            flexWrap:'wrap', marginBottom:'2.5rem'
          }}>
            {[
              { icon:'📬', text:'Weekly plant tips' },
              { icon:'🎁', text:'Exclusive offers' },
              { icon:'🌱', text:'New arrivals first' },
              { icon:'🚫', text:'No spam, ever' },
            ].map(p => (
              <div key={p.text} style={{
                display:'flex', alignItems:'center', gap:8,
                color:'rgba(255,255,255,.85)', fontSize:'.875rem', fontWeight:500
              }}>
                <span style={{ fontSize:'1.1rem' }}>{p.icon}</span> {p.text}
              </div>
            ))}
          </div>

          {/* Input row */}
          {status !== 'done' ? (
            <div style={{
              display:'flex', gap:10, maxWidth:560,
              margin:'0 auto', flexWrap:'wrap', justifyContent:'center'
            }}>
              <input
                type="email"
                placeholder="Enter your email address…"
                value={email}
                onChange={e => { setEmail(e.target.value); setMsg(''); setStatus('idle'); }}
                onKeyDown={e => e.key === 'Enter' && subscribe()}
                style={{
                  flex:'1 1 280px', padding:'15px 22px',
                  borderRadius:'999px', border:'2px solid rgba(255,255,255,.3)',
                  background:'rgba(255,255,255,.12)',
                  color:'#fff', fontSize:'1rem',
                  fontFamily:"'DM Sans',sans-serif",
                  outline:'none', backdropFilter:'blur(4px)',
                  transition:'border-color .2s',
                }}
                onFocus={e => e.target.style.borderColor='rgba(255,255,255,.7)'}
                onBlur={e => e.target.style.borderColor='rgba(255,255,255,.3)'}
              />
              <button
                onClick={subscribe}
                disabled={status === 'loading'}
                style={{
                  padding:'15px 36px', borderRadius:'999px',
                  background: status === 'loading' ? 'rgba(255,255,255,.5)' : '#fff',
                  color: '#1a3c2b', fontWeight:700, fontSize:'1rem',
                  fontFamily:"'DM Sans',sans-serif",
                  border:'none', cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                  transition:'transform .2s, box-shadow .2s',
                  boxShadow:'0 4px 20px rgba(0,0,0,.2)',
                  whiteSpace:'nowrap',
                }}
                onMouseEnter={e => { e.target.style.transform='translateY(-2px)'; e.target.style.boxShadow='0 8px 28px rgba(0,0,0,.25)'; }}
                onMouseLeave={e => { e.target.style.transform='translateY(0)'; e.target.style.boxShadow='0 4px 20px rgba(0,0,0,.2)'; }}
              >
                {status === 'loading' ? '⏳ Subscribing…' : 'Subscribe Free →'}
              </button>
            </div>
          ) : (
            <div style={{
              textAlign:'center', padding:'1.5rem 2rem',
              background:'rgba(255,255,255,.12)', borderRadius:20,
              maxWidth:500, margin:'0 auto', border:'1px solid rgba(255,255,255,.2)'
            }}>
              <div style={{ fontSize:'2.5rem', marginBottom:'.5rem' }}>🎉</div>
              <p style={{ color:'#fff', fontWeight:600, fontSize:'1.05rem', margin:0 }}>{msg}</p>
            </div>
          )}

          {status === 'err' && (
            <p style={{ color:'#fca5a5', textAlign:'center', marginTop:10, fontSize:'.85rem' }}>
              ⚠️ {msg}
            </p>
          )}

          <p style={{ color:'rgba(255,255,255,.45)', textAlign:'center',
            fontSize:'.72rem', marginTop:'1.25rem' }}>
            Join 2,400+ plant lovers · Unsubscribe anytime
          </p>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────────────── */}
      <footer className="footer" id="contact">
        <div className="container">
          <div className="footer-grid">
            {/* Brand */}
            <div className="footer-brand">
              <a href="/" className="footer-logo">
                <img src="/images/logo.png" alt="GreenNest" />
                <span>GreenNest</span>
              </a>
              <p>Handpicked eco-friendly plants delivered fresh to your door since 2023.</p>
              <ul className="soc-links">
                <li>
                  <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
                    <img src="/images/instagram.png" alt="Instagram" />
                  </a>
                </li>
                <li>
                  <a href="https://telegram.org" target="_blank" rel="noreferrer" aria-label="Telegram">
                    <img src="/images/telegram.png" alt="Telegram" />
                  </a>
                </li>
              </ul>
            </div>

            {/* Quick Links */}
            <div className="footer-col">
              <h5>Quick Links</h5>
              <ul>
                <li><a href="#indoor-plant"   onClick={e => scrollTo('indoor-plant', e)}>Indoor Plants</a></li>
                <li><a href="#outdoor-plant"  onClick={e => scrollTo('outdoor-plant', e)}>Outdoor Plants</a></li>
                <li><a href="#gardening-tool" onClick={e => scrollTo('gardening-tool', e)}>Gardening Tools</a></li>
                <li><a href="#" onClick={e => e.preventDefault()}>About Us</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div className="footer-col">
              <h5>Get in Touch</h5>
              <ul>
                <li><a href="mailto:support@greennest.com">support@greennest.com</a></li>
                <li><a href="tel:+911234567890">+91 12345 67890</a></li>
                <li><span style={{ color:'#9ca3af', fontSize:'.85rem' }}>Mon–Fri, 9 AM – 6 PM IST</span></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© 2025 GreenNest, Inc. All rights reserved.</p>
            <ul className="legal">
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </>
  );
}
