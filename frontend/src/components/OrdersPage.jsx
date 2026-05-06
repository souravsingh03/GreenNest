import React, { useEffect, useState } from "react";

const STATUS_LABELS = {
  PENDING:'⏳ Pending', CONFIRMED:'✅ Confirmed',
  SHIPPED:'🚚 Shipped', DELIVERED:'📦 Delivered', CANCELLED:'❌ Cancelled'
};

export default function OrdersPage({ apiFetch, onBack }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/orders')
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="orders-page page-fade">
      <div className="container">
        <h1>My Orders</h1>
        {[1,2].map(i => <div key={i} className="skeleton" style={{ height:140, marginBottom:16, borderRadius:16 }} />)}
      </div>
    </div>
  );

  return (
    <div className="orders-page page-fade">
      <div className="container">
        <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'2rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={onBack}>← Back</button>
          <h1 style={{ margin:0 }}>My Orders</h1>
        </div>

        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h3>No orders yet</h3>
            <p>Your orders will appear here after you checkout</p>
            <button className="btn btn-primary" onClick={onBack}>Start Shopping</button>
          </div>
        ) : (
          orders.map(order => (
            <div key={order.orderId} className="order-card">
              <div className="order-card-head">
                <div className="order-meta">
                  <strong>Order #{order.orderId}</strong> &nbsp;·&nbsp;
                  {new Date(order.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })} &nbsp;·&nbsp;
                  {order.paymentMethod}
                </div>
                <span className={`order-status status-${order.status}`}>
                  {STATUS_LABELS[order.status] || order.status}
                </span>
              </div>

              <div className="order-items-row">
                {(order.items || []).map((item, i) => (
                  <div
                    key={i}
                    className="order-thumb"
                    style={{ backgroundImage:`url(${item.imageUrl})` }}
                    title={item.productName}
                  />
                ))}
                <div style={{ fontSize:'.82rem', color:'var(--text-soft)', alignSelf:'center' }}>
                  {(order.items || []).map(i => `${i.productName} ×${i.quantity}`).join(', ')}
                </div>
              </div>

              <div className="order-card-foot">
                <div className="order-total">
                  Total: ₹{parseFloat(order.totalPrice).toFixed(2)}
                  {order.discountAmount > 0 && (
                    <span style={{ fontSize:'.78rem', color:'var(--g-mid)', marginLeft:8, fontWeight:400 }}>
                      (saved ₹{parseFloat(order.discountAmount).toFixed(2)})
                    </span>
                  )}
                </div>
                <div className="tracking-chip">
                  📦 {order.trackingNumber}
                </div>
                {order.status === 'PENDING' && (
                  <button className="btn btn-danger btn-sm">Cancel Order</button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
