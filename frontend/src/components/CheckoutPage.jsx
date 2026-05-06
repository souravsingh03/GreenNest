import React, { useState } from "react";
import PaymentPage from "./PaymentPage";

const METHODS = [
  { id:'COD',      icon:'💵', name:'Cash on Delivery', desc:'Pay when your order arrives' },
  { id:'UPI',      icon:'📱', name:'UPI Payment',       desc:'Google Pay, PhonePe, Paytm' },
  { id:'RAZORPAY', icon:'💳', name:'Card / Net Banking', desc:'Visa, Mastercard, Net Banking' },
];

export default function CheckoutPage({
  cart, user, onPlaceOrder, onBack,
  apiFetch, toast,
  initialCoupon = '', initialDiscount = null
}) {
  const [addr, setAddr] = useState({
    fullName: user?.name || '', phone:'', street:'', city:'', state:'', pincode:''
  });
  const [method, setMethod]       = useState('COD');
  const [coupon, setCoupon]       = useState(initialCoupon);
  const [discount, setDiscount]   = useState(initialDiscount);
  const [couponMsg, setCouponMsg] = useState(
    initialDiscount ? { ok: true, text: initialDiscount.message || '✅ Coupon applied!' } : null
  );
  const [applying, setApplying]   = useState(false);
  const [placing, setPlacing]     = useState(false);
  const [onPayPage, setOnPayPage] = useState(false);

  const set = (k, v) => setAddr(p => ({ ...p, [k]: v }));

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    setApplying(true); setCouponMsg(null); setDiscount(null);
    try {
      const d = await apiFetch('/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({ code: coupon.trim(), orderTotal: cart.totalPrice || 0 })
      });
      setDiscount(d);
      setCouponMsg({ ok: true, text: d.message || 'Coupon applied!' });
    } catch (e) {
      setCouponMsg({ ok: false, text: e.message });
    } finally { setApplying(false); }
  };

  const validate = () => {
    const checks = [
      [!addr.fullName.trim(),  'Please enter your full name'],
      [!addr.phone.trim(),     'Please enter your phone number'],
      [!addr.street.trim(),    'Please enter your street address'],
      [!addr.city.trim(),      'Please enter your city'],
      [!addr.state.trim(),     'Please enter your state'],
      [!addr.pincode.trim(),   'Please enter your pincode'],
      [!/^\d{10}$/.test(addr.phone),   'Phone must be 10 digits'],
      [!/^\d{6}$/.test(addr.pincode),  'Pincode must be 6 digits'],
    ];
    for (const [fail, msg] of checks) {
      if (fail) { toast(msg, 'err'); return false; }
    }
    return true;
  };

  const doPlaceOrder = async () => {
    setPlacing(true);
    try {
      const shippingAddress =
        `${addr.fullName}, ${addr.phone}, ${addr.street}, ${addr.city}, ${addr.state} - ${addr.pincode}`;
      await onPlaceOrder({
        shippingAddress,
        couponCode:    coupon.trim() || null,
        paymentMethod: method,
      });
    } catch (e) {
      toast(e.message || 'Failed to place order. Try again.', 'err');
    } finally { setPlacing(false); }
  };

  const handleProceed = () => {
    if (!validate()) return;
    if (method === 'COD') doPlaceOrder();
    else setOnPayPage(true);
  };

  const items      = cart?.items || [];
  const subtotal   = parseFloat(cart?.totalPrice || 0);
  const discAmt    = discount ? parseFloat(discount.discountAmount || 0) : 0;
  const finalTotal = Math.max(0, subtotal - discAmt);

  if (onPayPage) {
    return (
      <PaymentPage
        amount={finalTotal}
        paymentMethod={method}
        onSuccess={doPlaceOrder}
        onBack={() => setOnPayPage(false)}
        toast={toast}
      />
    );
  }

  if (!items.length) {
    return (
      <div className="checkout-page page-fade">
        <div className="container" style={{ textAlign:'center', padding:'5rem 0' }}>
          <div style={{ fontSize:'3.5rem', marginBottom:'1rem' }}>🛒</div>
          <h2 style={{ color:'var(--g-deep)', marginBottom:'.75rem' }}>Your cart is empty</h2>
          <p style={{ color:'var(--text-soft)', marginBottom:'2rem' }}>
            Add some plants to your basket first!
          </p>
          <button className="btn btn-primary" onClick={onBack}>Browse Products</button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page page-fade">
      <div className="container">
        <button className="btn btn-ghost btn-sm"
          onClick={onBack}
          style={{ marginBottom:'1.25rem', display:'inline-flex', alignItems:'center', gap:6 }}>
          ← Back to Cart
        </button>

        <h1 style={{ marginBottom:'1.75rem' }}>Checkout</h1>

        <div className="checkout-grid">

          {/* ───── LEFT ───── */}
          <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>

            {/* Address */}
            <div className="checkout-section">
              <h3>📦 Delivery Address</h3>
              <div className="form-row">
                <Field label="Full Name *">
                  <input value={addr.fullName} onChange={e=>set('fullName',e.target.value)} placeholder="Rahul Sharma"/>
                </Field>
                <Field label="Phone *">
                  <input value={addr.phone} onChange={e=>set('phone',e.target.value)} placeholder="10-digit mobile" maxLength={10} type="tel"/>
                </Field>
              </div>
              <Field label="Street Address *">
                <input value={addr.street} onChange={e=>set('street',e.target.value)} placeholder="Flat no., Street, Area"/>
              </Field>
              <div className="form-row">
                <Field label="City *">
                  <input value={addr.city} onChange={e=>set('city',e.target.value)} placeholder="Mumbai"/>
                </Field>
                <Field label="State *">
                  <input value={addr.state} onChange={e=>set('state',e.target.value)} placeholder="Maharashtra"/>
                </Field>
              </div>
              <Field label="Pincode *" style={{ maxWidth:180 }}>
                <input value={addr.pincode} onChange={e=>set('pincode',e.target.value)} placeholder="400001" maxLength={6} type="tel"/>
              </Field>
            </div>

            {/* Coupon */}
            <div className="checkout-section">
              <h3>🎟️ Coupon Code</h3>
              <div style={{ display:'flex', gap:10 }}>
                <input
                  style={{ flex:1, padding:'10px 13px', border:'1.5px solid var(--border)',
                    borderRadius:'var(--r-sm)', fontFamily:"'DM Sans',sans-serif",
                    fontSize:'.9rem', outline:'none' }}
                  placeholder="e.g. WELCOME10"
                  value={coupon}
                  onChange={e=>{ setCoupon(e.target.value.toUpperCase()); setDiscount(null); setCouponMsg(null); }}
                  onKeyDown={e=>e.key==='Enter'&&applyCoupon()}
                />
                <button className="btn btn-outline" onClick={applyCoupon} disabled={applying}>
                  {applying ? '…' : 'Apply'}
                </button>
              </div>
              {couponMsg && (
                <p style={{ marginTop:8, fontSize:'.83rem', fontWeight:600,
                  color: couponMsg.ok ? 'var(--g-mid)' : '#dc2626' }}>
                  {couponMsg.ok ? '✅' : '⚠️'} {couponMsg.text}
                </p>
              )}
              <p style={{ marginTop:6, fontSize:'.74rem', color:'var(--text-soft)' }}>
                Try: <strong>WELCOME10</strong> · <strong>FLAT50</strong> · <strong>GREENNEST20</strong>
              </p>
            </div>

            {/* Payment */}
            <div className="checkout-section">
              <h3>💳 Payment Method</h3>
              <div className="payment-opts">
                {METHODS.map(m => (
                  <label key={m.id} className={`pay-opt ${method===m.id?'selected':''}`}>
                    <input type="radio" name="pay" checked={method===m.id} onChange={()=>setMethod(m.id)}/>
                    <span className="pay-icon">{m.icon}</span>
                    <span className="pay-opt-label">
                      <span className="pay-opt-name">{m.name}</span>
                      <span className="pay-opt-desc">{m.desc}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* ───── RIGHT: Summary ───── */}
          <div className="order-summary-card">
            <h3>Order Summary</h3>
            <div style={{ maxHeight:260, overflowY:'auto', marginBottom:16 }}>
              {items.map(item => (
                <div key={item.cartItemId} className="summary-item">
                  <div className="summary-item-img"
                    style={{ backgroundImage:`url(${item.imageUrl})` }}/>
                  <div className="summary-item-info">
                    <div className="summary-item-name">{item.productName}</div>
                    <div className="summary-item-qty">Qty: {item.quantity}</div>
                  </div>
                  <span className="summary-item-price">
                    ₹{parseFloat(item.subtotal).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="summary-totals">
              <div className="total-row">
                <span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span>
              </div>
              {discAmt > 0 && (
                <div className="total-row discount">
                  <span>Discount ({coupon})</span><span>−₹{discAmt.toFixed(2)}</span>
                </div>
              )}
              <div className="total-row">
                <span>Delivery</span>
                <span style={{ color:'var(--g-mid)', fontWeight:600 }}>Free 🌿</span>
              </div>
              <div className="total-row big">
                <span>Total</span><span>₹{finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              className="btn btn-primary place-order-btn"
              onClick={handleProceed}
              disabled={placing}
            >
              {placing ? '⏳ Placing Order…'
                : method === 'COD'
                  ? `Place Order · ₹${finalTotal.toFixed(2)}`
                  : `Proceed to Pay · ₹${finalTotal.toFixed(2)}`
              }
            </button>
            <div className="secure-note">🔒 Secure &amp; encrypted checkout</div>
          </div>

        </div>
      </div>
    </div>
  );
}

function Field({ label, children, style }) {
  return (
    <div className="form-field" style={style}>
      <label style={{ fontSize:'.78rem', fontWeight:600, color:'var(--text-mid)',
        display:'block', marginBottom:5 }}>{label}</label>
      {children}
    </div>
  );
}
