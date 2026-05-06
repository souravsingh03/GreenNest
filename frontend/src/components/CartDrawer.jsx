import React, { useState } from "react";

export default function CartDrawer({ open, onClose, cart, onUpdateQty, onRemove, onCheckout, apiFetch, toast }) {
  const [coupon, setCoupon]     = useState('');
  const [couponMsg, setCouponMsg] = useState(null);
  const [discount, setDiscount]   = useState(null);
  const [applying, setApplying]   = useState(false);

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    setApplying(true); setCouponMsg(null);
    try {
      const d = await apiFetch('/coupons/validate', {
        method:'POST',
        body: JSON.stringify({ code: coupon.trim(), orderTotal: cart.totalPrice || 0 })
      });
      setDiscount(d);
      setCouponMsg({ ok:true, text: d.message || 'Coupon applied!' });
    } catch (e) {
      setDiscount(null);
      setCouponMsg({ ok:false, text: e.message });
    } finally { setApplying(false); }
  };

  const items = cart?.items || [];
  const subtotal = parseFloat(cart?.totalPrice || 0);
  const discAmt  = discount ? parseFloat(discount.discountAmount || 0) : 0;
  const total    = Math.max(0, subtotal - discAmt);

  return (
    <>
      {/* overlay */}
      <div
        style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,.45)',
          zIndex:500, opacity:open?1:0, pointerEvents:open?'all':'none',
          transition:'opacity .28s ease'
        }}
        onClick={onClose}
      />

      {/* drawer */}
      <div style={{
        position:'fixed', top:0, right:0, height:'100%', width:420, maxWidth:'100vw',
        background:'#fff', zIndex:501, display:'flex', flexDirection:'column',
        boxShadow:'-8px 0 40px rgba(0,0,0,.18)',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition:'transform .3s cubic-bezier(.4,0,.2,1)'
      }}>

        {/* Head */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
          padding:'1.25rem 1.5rem', borderBottom:'1px solid var(--border)' }}>
          <h3 style={{ margin:0, color:'var(--g-deep)', fontSize:'1.1rem' }}>
            🛒 My Basket {items.length > 0 && `(${cart.totalItems || items.length})`}
          </h3>
          <button onClick={onClose}
            style={{ background:'none', border:'none', fontSize:'1.2rem', cursor:'pointer',
              color:'var(--text-soft)', lineHeight:1 }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ flex:1, overflowY:'auto', padding:'1rem 1.5rem' }}>
          {items.length === 0 ? (
            <div style={{ textAlign:'center', padding:'3rem 0', color:'var(--text-soft)' }}>
              <div style={{ fontSize:'3.5rem', marginBottom:'1rem' }}>🌿</div>
              <h4 style={{ color:'var(--text)', marginBottom:8 }}>Your basket is empty</h4>
              <p style={{ fontSize:'.85rem', marginBottom:'1.25rem' }}>
                Add some plants or tools to get started
              </p>
              <button className="btn btn-primary btn-sm" onClick={onClose}>Browse Products</button>
            </div>
          ) : (
            <>
              {items.map(item => (
                <div key={item.cartItemId} style={{
                  display:'flex', gap:12, padding:'12px 0',
                  borderBottom:'1px solid var(--border)' }}>
                  <div style={{
                    width:72, height:72, borderRadius:8, flexShrink:0,
                    backgroundImage:`url(${item.imageUrl})`,
                    backgroundSize:'cover', backgroundPosition:'center'
                  }}/>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:'.9rem', color:'var(--text)',
                      marginBottom:4 }}>{item.productName}</div>
                    <div style={{ fontSize:'.8rem', color:'var(--text-soft)',
                      marginBottom:8 }}>₹{parseFloat(item.unitPrice).toFixed(2)} each</div>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <button onClick={() => item.quantity>1
                        ? onUpdateQty(item.cartItemId, item.quantity-1)
                        : onRemove(item.cartItemId)}
                        style={{ width:26, height:26, borderRadius:'50%',
                          border:'1.5px solid var(--border)', background:'transparent',
                          cursor:'pointer', fontSize:'.9rem', display:'flex',
                          alignItems:'center', justifyContent:'center' }}>−</button>
                      <span style={{ fontSize:'.85rem', fontWeight:600, minWidth:20,
                        textAlign:'center' }}>{item.quantity}</span>
                      <button onClick={() => onUpdateQty(item.cartItemId, item.quantity+1)}
                        style={{ width:26, height:26, borderRadius:'50%',
                          border:'1.5px solid var(--border)', background:'transparent',
                          cursor:'pointer', fontSize:'.9rem', display:'flex',
                          alignItems:'center', justifyContent:'center' }}>+</button>
                    </div>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column',
                    alignItems:'flex-end', gap:8 }}>
                    <span style={{ fontWeight:700, color:'var(--g-deep)', fontSize:'.95rem' }}>
                      ₹{parseFloat(item.subtotal).toFixed(2)}
                    </span>
                    <button onClick={() => onRemove(item.cartItemId)}
                      style={{ background:'none', border:'none', cursor:'pointer',
                        fontSize:'.75rem', color:'#ef4444' }}>🗑 Remove</button>
                  </div>
                </div>
              ))}

              {/* Coupon */}
              <div style={{ marginTop:'1.25rem', padding:'1rem',
                background:'var(--cream)', borderRadius:'var(--r-sm)',
                border:'1px solid var(--border)' }}>
                <label style={{ fontSize:'.8rem', fontWeight:600,
                  color:'var(--text-mid)', display:'block', marginBottom:8 }}>
                  Have a coupon code?
                </label>
                <div style={{ display:'flex', gap:8 }}>
                  <input
                    style={{ flex:1, padding:'8px 12px',
                      border:'1.5px solid var(--border)',
                      borderRadius:'var(--r-sm)',
                      fontFamily:"'DM Sans',sans-serif",
                      fontSize:'.85rem', outline:'none' }}
                    placeholder="e.g. WELCOME10"
                    value={coupon}
                    onChange={e=>{ setCoupon(e.target.value.toUpperCase());
                      setDiscount(null); setCouponMsg(null); }}
                    onKeyDown={e=>e.key==='Enter'&&applyCoupon()}
                  />
                  <button className="btn btn-outline btn-sm"
                    onClick={applyCoupon} disabled={applying}>
                    {applying ? '…' : 'Apply'}
                  </button>
                </div>
                {couponMsg && (
                  <p style={{ marginTop:6, fontSize:'.78rem', fontWeight:600,
                    color:couponMsg.ok?'var(--g-mid)':'#dc2626' }}>
                    {couponMsg.ok?'✅':'⚠️'} {couponMsg.text}
                  </p>
                )}
                <p style={{ marginTop:5, fontSize:'.72rem', color:'var(--text-soft)' }}>
                  Try: WELCOME10 · FLAT50 · GREENNEST20
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer totals + CTA */}
        {items.length > 0 && (
          <div style={{ padding:'1.25rem 1.5rem',
            borderTop:'1px solid var(--border)', background:'#fff' }}>
            <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:'1rem' }}>
              <Row label="Subtotal" value={`₹${subtotal.toFixed(2)}`}/>
              {discAmt > 0 && (
                <Row label={`Discount (${coupon})`}
                  value={`−₹${discAmt.toFixed(2)}`}
                  green/>
              )}
              <Row label="Delivery" value="Free 🌿" green/>
              <Row label="Total" value={`₹${total.toFixed(2)}`} bold/>
            </div>

            <button
              className="btn btn-primary"
              style={{ width:'100%', justifyContent:'center',
                padding:'13px', fontSize:'1rem',
                borderRadius:'var(--r-sm)' }}
              onClick={() => onCheckout(coupon, discount)}
            >
              Proceed to Checkout →
            </button>
            <button className="btn btn-ghost"
              style={{ width:'100%', justifyContent:'center',
                marginTop:8, fontSize:'.875rem' }}
              onClick={onClose}>
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function Row({ label, value, green, bold }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', fontSize:'.875rem',
      fontWeight: bold ? 700 : 400,
      color: bold ? 'var(--g-deep)' : green ? 'var(--g-mid)' : 'var(--text)' }}>
      <span>{label}</span><span>{value}</span>
    </div>
  );
}
