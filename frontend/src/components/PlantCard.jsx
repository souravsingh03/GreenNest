import React from "react";

export default function PlantCard({ product, onAddToCart, onWishlist, inWishlist, onDetails }) {
  const { name, price, imageUrl, tags = [], stock, averageRating, reviewCount, badge } = product;
  const isLow = stock > 0 && stock < 10;
  const isOut = stock === 0;

  const renderStars = (rating) => {
    const full = Math.floor(rating || 0);
    const half = (rating || 0) - full >= 0.5;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half ? 1 : 0));
  };

  return (
    <div className="card-container">
      <div className="card-img-wrap">
        <div className="card-img" style={{ backgroundImage: `url(${imageUrl})` }} />
        {badge && (
          <span className={`card-badge badge-${badge}`}>
            {badge === 'new' ? '✨ New' : badge === 'sale' ? '🔖 Sale' : '🔥 Hot'}
          </span>
        )}
        <button
          className={`wish-btn ${inWishlist ? 'active' : ''}`}
          onClick={onWishlist}
          title={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          {inWishlist ? '❤️' : '🤍'}
        </button>
      </div>
      <div className="card-body">
        <h3 style={{ cursor:'pointer' }} onClick={onDetails}>{name}</h3>
        <ul className="card-tags">
          {tags.slice(0,3).map((t, i) => <li key={i}>{t}</li>)}
        </ul>
        {averageRating > 0 && (
          <div className="card-rating">
            <span className="stars">{renderStars(averageRating)}</span>
            <span className="rating-count">({reviewCount || 0})</span>
          </div>
        )}
        <div className={`card-stock ${isOut ? 'out' : isLow ? 'low' : 'ok'}`}>
          {isOut ? '❌ Out of stock' : isLow ? `⚠️ Only ${stock} left` : '✅ In stock'}
        </div>
        <div className="card-footer">
          <div>
            <span className="card-price">₹{parseFloat(price).toFixed(2)}</span>
          </div>
          <div style={{ display:'flex', gap:6 }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={onDetails}
              title="View details"
              style={{ padding:'6px 10px' }}
            >👁</button>
            <button
              className="btn btn-primary btn-sm"
              onClick={onAddToCart}
              disabled={isOut}
              style={{ opacity: isOut ? .5 : 1 }}
            >
              {isOut ? 'Sold Out' : '+ Basket'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
