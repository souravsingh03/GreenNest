import React, { useEffect, useState } from "react";
import PlantCard from "./PlantCard";

const BASE = 'https://greennest-production.up.railway.app/api';

const FALLBACK = {
  "INDOOR_PLANT": [
    { id:1, name:'Peace Lily',   tags:['Indoor','Easy Care'],    imageUrl:'/images/Peace_lily.jpg',    price:24.99, stock:50 },
    { id:2, name:'Snake Plant',  tags:['Indoor','Low Light'],    imageUrl:'/images/Snake_Plant.jpg',   price:19.99, stock:60 },
    { id:3, name:'Pothos',       tags:['Indoor','Fast Growing'], imageUrl:'/images/Pothos.jpg',        price:14.99, stock:75 },
  ],
  "OUTDOOR_PLANT": [
    { id:4, name:'Lavender',   tags:['Outdoor','Sunny'],     imageUrl:'/images/Lavender.jpg',    price:12.99, stock:40 },
    { id:5, name:'Rose Bush',  tags:['Outdoor','Flowering'], imageUrl:'/images/Rose_bush.jpg',   price:29.99, stock:30 },
    { id:6, name:'Fern',       tags:['Outdoor','Shade'],     imageUrl:'/images/Fern.webp',       price:16.99, stock:45 },
  ],
  "GARDENING_TOOL": [
    { id:7, name:'Trowel',          tags:['Hand Tool','Durable'],      imageUrl:'/images/trovel.jpg',         price:9.99,  stock:100 },
    { id:8, name:'Pruning Shears',  tags:['Precision','Ergonomic'],    imageUrl:'/images/Pruningtool.jpg',    price:18.99, stock:80  },
    { id:9, name:'Watering Can',    tags:['2L Capacity','Eco-Friendly'],imageUrl:'/images/Watering_can.avif', price:12.99, stock:60  },
  ],
};

const CATEGORY_MAP = {
  "Indoor Plants":   "INDOOR_PLANT",
  "Outdoor Plants":  "OUTDOOR_PLANT",
  "Gardening Tools": "GARDENING_TOOL",
};

function PlantSection({ id, title, icon, onAddToCart, showToast, searchParams }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const catKey = CATEGORY_MAP[title];

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();

    // If search has a category filter AND it doesn't match this section, hide results
    if (searchParams?.category && searchParams.category !== catKey) {
      // Show empty — another section will display this
      setProducts([]);
      setLoading(false);
      return;
    }

    params.append('category', catKey);

    if (searchParams?.query)    params.append('keyword', searchParams.query);
    if (searchParams?.minPrice) params.append('minPrice', searchParams.minPrice);
    if (searchParams?.maxPrice) params.append('maxPrice', searchParams.maxPrice);

    // Parse sortBy
    if (searchParams?.sortBy) {
      const sortMap = {
        'price_asc':  { sortBy:'price', sortDir:'asc' },
        'price_desc': { sortBy:'price', sortDir:'desc' },
        'name':       { sortBy:'name',  sortDir:'asc' },
        'newest':     { sortBy:'newest',sortDir:'desc' },
      };
      const s = sortMap[searchParams.sortBy] || {};
      if (s.sortBy)  params.append('sortBy',  s.sortBy);
      if (s.sortDir) params.append('sortDir', s.sortDir);
    }

    params.append('size', '12');

    fetch(`${BASE}/products?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data
                   : Array.isArray(data.content) ? data.content
                   : [];
        setProducts(list.length > 0 ? list : FALLBACK[catKey] || []);
      })
      .catch(() => setProducts(FALLBACK[catKey] || []))
      .finally(() => setLoading(false));
  }, [title, searchParams]);

  const handleAddToCart = async (product) => {
    const token = localStorage.getItem('gn_token');
    if (!token) { showToast('Please sign in to add items '); return; }
    try {
      await onAddToCart(product.id);
      showToast(`${product.name} added to basket! 🛒`);
    } catch { showToast('Could not add item. Try again.'); }
  };

  // If filtered to a different category, don't render this section at all
  if (searchParams?.category && searchParams.category !== catKey) return null;

  const isToolSection = title === "Gardening Tools";

  return (
    <section className="plant-section" id={id}>
      <div className="container">
        <div className="section-header">
          <div className="section-title-group">
            <div className="section-eyebrow">{isToolSection ? 'Equip Your Garden' : 'Shop our collection'}</div>
            <h2><img src={icon} alt={title} className="plant-icon" />{title}</h2>
          </div>
          <span className="product-count">{loading ? '' : `${products.length} items`}</span>
        </div>

        {!loading && products.length === 0 ? (
          <div className="no-results">
            <span style={{fontSize:'3rem'}}>🔍</span>
            <p>No {title.toLowerCase()} found for your search.</p>
            <small>Try different keywords or remove some filters.</small>
          </div>
        ) : (
          <div className="plant-grid">
            {loading
              ? [1,2,3].map(i => (
                  <div key={i} className="card-container">
                    <div className="skeleton" style={{height:'220px'}} />
                    <div className="card-info">
                      <div className="skeleton" style={{height:'20px',marginBottom:'8px',width:'60%'}} />
                      <div className="skeleton" style={{height:'14px',width:'80%'}} />
                    </div>
                  </div>
                ))
              : products.map(p => (
                  <PlantCard
                    key={p.id}
                    image={p.imageUrl}
                    title={p.name}
                    tags={p.tags || []}
                    buttonText={isToolSection ? 'Buy Now' : 'Add to Basket'}
                    price={p.price ? parseFloat(p.price).toFixed(2) : null}
                    stock={p.stock}
                    rating={p.averageRating}
                    reviewCount={p.reviewCount}
                    onAddToCart={() => handleAddToCart(p)}
                  />
                ))
            }
          </div>
        )}
      </div>
    </section>
  );
}

export default PlantSection;
