import React, { useState, useEffect } from "react";

const UPI_APPS = [
  { id:'gpay',    icon:'🟢', name:'Google Pay' },
  { id:'phonepe', icon:'🟣', name:'PhonePe' },
  { id:'paytm',   icon:'🔵', name:'Paytm' },
];

export default function PaymentPage({ amount, paymentMethod, orderData, onSuccess, onBack, apiFetch, toast }) {
  const [step, setStep] = useState('input'); // input | processing | done
  const [upiApp, setUpiApp] = useState('');
  const [upiId, setUpiId] = useState('');
  const [cardNum, setCardNum] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [payTab, setPayTab] = useState(paymentMethod === 'RAZORPAY' ? 'card' : 'upi');
  const [progress, setProgress] = useState(0);

  const formatCard = (v) => v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim();
  const formatExpiry = (v) => {
    const d = v.replace(/\D/g,'').slice(0,4);
    return d.length > 2 ? d.slice(0,2)+'/'+d.slice(2) : d;
  };

  const validate = () => {
    if (payTab === 'upi') {
      if (!upiId.includes('@')) { toast('Please enter a valid UPI ID (e.g. name@upi)', 'err'); return false; }
    } else {
      if (cardNum.replace(/\s/g,'').length < 16) { toast('Enter a 16-digit card number', 'err'); return false; }
      if (cardExpiry.length < 5) { toast('Enter card expiry (MM/YY)', 'err'); return false; }
      if (cardCvv.length < 3) { toast('Enter 3-digit CVV', 'err'); return false; }
      if (!cardName.trim()) { toast('Enter cardholder name', 'err'); return false; }
    }
    return true;
  };

  const handlePay = async () => {
    if (!validate()) return;
    setStep('processing');

    // Simulate payment processing with progress
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 20;
      if (p >= 100) { p = 100; clearInterval(interval); }
      setProgress(Math.min(p, 100));
    }, 200);

    // Place the actual order after simulated delay
    setTimeout(async () => {
      clearInterval(interval);
      setProgress(100);
      try {
        await onSuccess();
        setStep('done');
      } catch(e) {
        toast(e.message || 'Payment failed. Try again.', 'err');
        setStep('input');
      }
    }, 2800);
  };

  if (step === 'done') return (
    <div className="payment-page">
      <div className="payment-card">
        <div className="pay-done">
          <div className="pay-done-icon">✅</div>
          <h2 style={{ color:'var(--g-deep)' }}>Payment Successful!</h2>
          <p style={{ color:'var(--text-mid)', fontSize:'.9rem' }}>
            ₹{parseFloat(amount).toFixed(2)} paid via {payTab === 'upi' ? 'UPI' : 'Card'}
          </p>
          <p style={{ fontSize:'.8rem', color:'var(--text-soft)' }}>Your plants are being packed with eco-friendly materials 🌿</p>
        </div>
      </div>
    </div>
  );

  if (step === 'processing') return (
    <div className="payment-page">
      <div className="payment-card">
        <div className="pay-processing">
          <div className="pay-spinner" />
          <h3 style={{ color:'var(--g-deep)' }}>Processing Payment…</h3>
          <p style={{ fontSize:'.85rem', color:'var(--text-soft)' }}>Please do not close this window</p>
          <div style={{ width:'100%', background:'var(--border)', borderRadius:99, height:8, overflow:'hidden' }}>
            <div style={{ height:'100%', background:'var(--g-bright)', borderRadius:99, width:`${progress}%`, transition:'width .3s ease' }} />
          </div>
          <p style={{ fontSize:'.78rem', color:'var(--text-soft)' }}>{Math.round(progress)}%</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="payment-page">
      <div className="payment-card">
        <h2>Complete Payment</h2>
        <p className="pay-sub">Secure payment powered by GreenNest Pay 🔒</p>

        <div className="pay-amount-box">
          <span className="pay-label">Amount to Pay</span>
          <span className="pay-total">₹{parseFloat(amount).toFixed(2)}</span>
        </div>

        {/* Payment method tabs */}
        <div className="pay-method-tabs">
          <button className={`pay-method-tab ${payTab==='upi'?'active':''}`} onClick={() => setPayTab('upi')}>📱 UPI</button>
          <button className={`pay-method-tab ${payTab==='card'?'active':''}`} onClick={() => setPayTab('card')}>💳 Card</button>
          <button className={`pay-method-tab ${payTab==='nb'?'active':''}`} onClick={() => setPayTab('nb')}>🏦 Net Banking</button>
        </div>

        {/* UPI */}
        {payTab === 'upi' && (
          <>
            <p style={{ fontSize:'.8rem', color:'var(--text-mid)', marginBottom:12 }}>Choose your UPI app:</p>
            <div className="upi-apps">
              {UPI_APPS.map(app => (
                <button
                  key={app.id}
                  className={`upi-app-btn ${upiApp===app.id?'selected':''}`}
                  onClick={() => setUpiApp(app.id)}
                >
                  <span className="app-icon">{app.icon}</span>
                  {app.name}
                </button>
              ))}
            </div>
            <p style={{ fontSize:'.8rem', color:'var(--text-mid)', marginBottom:6 }}>Or enter UPI ID manually:</p>
            <input
              className="upi-id-input"
              placeholder="yourname@upi"
              value={upiId}
              onChange={e => setUpiId(e.target.value)}
            />
          </>
        )}

        {/* Card */}
        {payTab === 'card' && (
          <div className="card-input-grid">
            <div className="card-field">
              <label>Card Number</label>
              <input
                placeholder="1234 5678 9012 3456"
                value={cardNum}
                onChange={e => setCardNum(formatCard(e.target.value))}
                maxLength={19}
              />
            </div>
            <div className="card-field">
              <label>Cardholder Name</label>
              <input placeholder="As on card" value={cardName} onChange={e => setCardName(e.target.value)} />
            </div>
            <div className="card-input-row">
              <div className="card-field">
                <label>Expiry (MM/YY)</label>
                <input placeholder="12/27" value={cardExpiry} onChange={e => setCardExpiry(formatExpiry(e.target.value))} maxLength={5} />
              </div>
              <div className="card-field">
                <label>CVV</label>
                <input placeholder="•••" type="password" value={cardCvv} onChange={e => setCvv(e.target.value.slice(0,4))} maxLength={4} />
              </div>
            </div>
          </div>
        )}

        {/* Net Banking */}
        {payTab === 'nb' && (
          <div style={{ textAlign:'center', padding:'1.5rem 0' }}>
            <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>🏦</div>
            <p style={{ color:'var(--text-mid)', fontSize:'.9rem', marginBottom:'1rem' }}>
              You will be redirected to your bank's secure portal to complete the payment.
            </p>
            <select style={{ width:'100%', padding:'11px 13px', border:'1.5px solid var(--border)', borderRadius:'var(--r-sm)', fontFamily:"'DM Sans',sans-serif", fontSize:'.9rem', outline:'none' }}>
              <option>Select your bank</option>
              <option>State Bank of India</option>
              <option>HDFC Bank</option>
              <option>ICICI Bank</option>
              <option>Axis Bank</option>
              <option>Kotak Mahindra Bank</option>
              <option>Punjab National Bank</option>
            </select>
          </div>
        )}

        <button className="btn btn-primary" style={{ width:'100%', justifyContent:'center', padding:'14px', fontSize:'1rem', marginTop:'1.25rem', borderRadius:'var(--r-sm)' }} onClick={handlePay}>
          🔒 Pay ₹{parseFloat(amount).toFixed(2)}
        </button>

        <div className="pay-secure-line">
          🔒 256-bit SSL encrypted · PCI DSS compliant · Verified by GreenNest
        </div>

        <button className="btn btn-ghost" style={{ width:'100%', justifyContent:'center', marginTop:10, fontSize:'.85rem' }} onClick={onBack}>
          ← Change payment method
        </button>
      </div>
    </div>
  );
}
