import React from "react";

export default function OrderSuccess({ order, onContinue, onViewOrders }) {
  if (!order) return null;
  return (
    <div className="success-page page-fade">
      <div className="success-card">
        <div className="success-icon">🎉</div>
        <h2>Order Placed!</h2>
        <p>Thank you for shopping with GreenNest.</p>
        <p style={{ fontSize:'.85rem' }}>Your plants are being packed with eco-friendly materials.</p>
        <div className="order-id-box">
          Order #{order.orderId}
        </div>
        <div className="tracking-info">
          📦 Tracking: <strong>{order.trackingNumber}</strong>
        </div>
        <div style={{ background:'var(--g-mist)', borderRadius:'var(--r-sm)', padding:'12px 16px', marginBottom:'1.5rem', textAlign:'left' }}>
          <div style={{ fontSize:'.78rem', color:'var(--text-soft)', marginBottom:4 }}>Order Total</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.3rem', color:'var(--g-deep)', fontWeight:700 }}>
            ₹{parseFloat(order.totalPrice).toFixed(2)}
          </div>
          {order.discountAmount > 0 && (
            <div style={{ fontSize:'.78rem', color:'var(--g-mid)', marginTop:2 }}>
              You saved ₹{parseFloat(order.discountAmount).toFixed(2)} with coupon {order.couponCode}!
            </div>
          )}
        </div>
        <div style={{ background:'#fef3c7', borderRadius:'var(--r-sm)', padding:'10px 14px', fontSize:'.82rem', color:'#92400e', marginBottom:'1.5rem' }}>
          📬 Expected delivery: <strong>3–5 business days</strong><br/>
          You'll receive updates on {order.status === 'PENDING' ? 'your registered email' : order.status}.
        </div>
        <div className="success-actions">
          <button className="btn btn-primary" onClick={onViewOrders}>View My Orders</button>
          <button className="btn btn-outline" onClick={onContinue}>Continue Shopping</button>
        </div>
      </div>
    </div>
  );
}
