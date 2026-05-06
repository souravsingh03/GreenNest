import React, { useState } from "react";

export default function ProductModal({ product, onClose, onAddToCart, onWishlist, inWishlist, user, toast }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const { name, price, imageUrl, tags=[], averageRating, reviewCount, stock, description, badge } = product;
  const isOut = stock === 0;

  const submitReview = () => {
    if (!user) { toast('Sign in to leave a review'); return; }
    if (!rating) { toast('Please select a rating', 'err'); return; }
    if (!review.trim()) { toast('Please write a review', 'err'); return; }
    setReviewSubmitted(true);
    toast('Review submitted! Thank you 🌿');
  };

  const CARE_TIPS = {
    INDOOR_PLANT: ['💧 Water when top inch is dry','☀️ Bright indirect light','🌡️ 18–27°C ideal','🪴 Repot every 1–2 years'],
    OUTDOOR_PLANT: ['💧 Deep water 2–3x weekly','☀️ Full sun or part shade','🪱 Enrich with compost','✂️ Deadhead to extend bloom'],
    GARDENING_TOOL: ['🧼 Clean after each use','🪜 Store in dry location','🔧 Oil metal parts regularly','📦 Keep handles splinter-free'],
  };
  const tips = CARE_TIPS[product.category] || CARE_TIPS.INDOOR_PLANT;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="product-modal" style={{ position:'relative' }}>
        <button className="modal-close" onClick={onClose} style={{ position:'sticky', top:12, left:'calc(100% - 50px)', zIndex:10 }}>✕</button>
        <div className="modal-inner">
          <div className="modal-img" style={{ backgroundImage:`url(${imageUrl})` }} />
          <div className="modal-body">
            {badge && (
              <span className={`card-badge badge-${badge}`} style={{ position:'static', display:'inline-block', marginBottom:8 }}>
                {badge === 'new' ? '✨ New Arrival' : badge === 'sale' ? '🔖 On Sale' : '🔥 Best Seller'}
              </span>
            )}
            <h2 style={{ fontSize:'1.5rem', color:'var(--g-deep)' }}>{name}</h2>
            <div className="modal-tags">
              {tags.map((t,i) => <span key={i} className="modal-tag">{t}</span>)}
            </div>
            {averageRating > 0 && (
              <div style={{ display:'flex', alignItems:'center', gap:8, margin:'8px 0' }}>
                <span style={{ color:'#f59e0b', fontSize:'1rem' }}>{'★'.repeat(Math.round(averageRating))}</span>
                <span style={{ fontSize:'.8rem', color:'var(--text-soft)' }}>{averageRating} ({reviewCount} reviews)</span>
              </div>
            )}
            <div className="modal-price">₹{parseFloat(price).toFixed(2)}</div>
            <p className="modal-desc">{description || 'A premium quality plant carefully selected and nurtured for your home or garden.'}</p>
            <div className={`card-stock ${isOut ? 'out' : stock < 10 ? 'low' : 'ok'}`} style={{ marginBottom:16 }}>
              {isOut ? '❌ Out of stock' : stock < 10 ? `⚠️ Only ${stock} left` : '✅ In stock — ready to ship'}
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={onAddToCart} disabled={isOut}>
                {isOut ? 'Sold Out' : '🛒 Add to Basket'}
              </button>
              <button
                className={`btn ${inWishlist ? 'btn-danger' : 'btn-outline'}`}
                onClick={onWishlist}
              >
                {inWishlist ? '❤️ Saved' : '🤍 Wishlist'}
              </button>
            </div>

            <div className="modal-care">
              <h5>🌿 Care Guide</h5>
              <ul>{tips.map((t,i) => <li key={i}>{t}</li>)}</ul>
            </div>

            {/* Review section */}
            {!reviewSubmitted ? (
              <div className="review-form" style={{ marginTop:'1rem' }}>
                <p style={{ fontSize:'.8rem', fontWeight:600, color:'var(--text-mid)', marginBottom:8 }}>Rate this product:</p>
                <div className="rating-widget">
                  {[1,2,3,4,5].map(s => (
                    <span
                      key={s}
                      className={`rating-star ${s <= (hoverRating || rating) ? 'filled' : ''}`}
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(s)}
                    >★</span>
                  ))}
                </div>
                <textarea
                  className=""
                  placeholder="Share your experience with this product..."
                  value={review}
                  onChange={e => setReview(e.target.value)}
                  style={{ width:'100%', padding:'9px 12px', border:'1.5px solid var(--border)', borderRadius:'var(--r-sm)', fontFamily:"'DM Sans',sans-serif", fontSize:'.85rem', resize:'vertical', minHeight:70, outline:'none', marginTop:8 }}
                />
                <button className="btn btn-outline btn-sm" style={{ marginTop:8 }} onClick={submitReview}>
                  Submit Review
                </button>
              </div>
            ) : (
              <div style={{ background:'var(--g-mist)', borderRadius:'var(--r-sm)', padding:'12px', marginTop:'1rem', textAlign:'center', color:'var(--g-mid)', fontWeight:600 }}>
                ✅ Thank you for your review!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
