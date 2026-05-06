import React, { useEffect, useState, useMemo } from "react";
import PlantCard from "./PlantCard";
import ProductModal from "./ProductModal";

const BASE = 'https://greennest-production.up.railway.app/api';

// ── Real image URLs for every product ────────────────────────────────────────
// Hosted on Wikimedia Commons (public domain, no auth, no CORS issues)
const IMAGES = {
  'peace lily':          '/images/Peace_lily.jpg',
  'snake plant':         '/images/Snake_Plant.jpg',
  'pothos':              '/images/Pothos.jpg',


  'lavender':            '/images/Lavender.jpg',
  'rose bush':           '/images/Rose_bush.jpg',
  'fern':                '/images/Fern.webp',

  'trowel':              '/images/trovel.jpg',
  'pruning shears':      '/images/Pruningtool.jpg',
  'watering can':        '/images/Watering_can.webp',

};
const ALLOWED_PRODUCTS = [
  'peace lily',
  'snake plant',
  'pothos',
  'lavender',
  'rose bush',
  'fern',
  'trowel',
  'pruning shears',
  'watering can'
];

const img = (name) => IMAGES[name?.toLowerCase().trim()] || '/images/Peace_lily.jpg';

const FALLBACK = [
  { id:1,  name:'Peace Lily',          category:'INDOOR_PLANT',  tags:['Indoor','Easy Care','Air Purifier'],     price:'24.99', stock:50, badge:'hot',  averageRating:4.8, reviewCount:128, description:'A stunning indoor plant with elegant white flowers and exceptional air-purifying abilities. Perfect for low-light rooms.' },
  { id:2,  name:'Snake Plant',         category:'INDOOR_PLANT',  tags:['Indoor','Low Light','Beginner'],         price:'19.99', stock:60, badge:'new',  averageRating:4.9, reviewCount:214, description:'One of the hardiest plants. Tolerates low light and irregular watering, releases oxygen at night.' },
  { id:3,  name:'Pothos',              category:'INDOOR_PLANT',  tags:['Indoor','Fast Growing','Trailing'],      price:'14.99', stock:75, badge:null,   averageRating:4.7, reviewCount:89,  description:'The ultimate beginner plant — nearly indestructible, fast-growing, gorgeous cascading from shelves.' },

  { id:9,  name:'Lavender',            category:'OUTDOOR_PLANT', tags:['Outdoor','Sunny','Fragrant'],            price:'12.99', stock:40, badge:null,   averageRating:4.8, reviewCount:97,  description:'English Lavender fills the air with intoxicating fragrance all summer long. A garden classic.' },
  { id:10, name:'Rose Bush',           category:'OUTDOOR_PLANT', tags:['Outdoor','Flowering','Classic'],         price:'29.99', stock:30, badge:'hot',  averageRating:4.7, reviewCount:189, description:'Heritage rose bush producing abundant velvety blooms from spring to autumn.' },
  { id:11, name:'Fern',                category:'OUTDOOR_PLANT', tags:['Outdoor','Shade','Moisture Loving'],     price:'16.99', stock:45, badge:null,   averageRating:4.6, reviewCount:62,  description:'Boston Fern adds lush tropical texture to shady gardens and patios. Loves humidity.' },

  { id:16, name:'Trowel',              category:'GARDENING_TOOL',tags:['Hand Tool','Stainless Steel','Durable'], price:'9.99',  stock:100,badge:null,   averageRating:4.7, reviewCount:312, description:'Forged stainless steel trowel with ergonomic rubber grip. Rust-resistant and durable.' },
  { id:17, name:'Pruning Shears',      category:'GARDENING_TOOL',tags:['Precision','Ergonomic','Bypass'],        price:'18.99', stock:80, badge:'hot',  averageRating:4.8, reviewCount:278, description:'Professional bypass pruners with razor-sharp blades. Makes clean cuts for healthy plant growth.' },
  { id:18, name:'Watering Can',        category:'GARDENING_TOOL',tags:['2L','Eco-Friendly','Indoor/Outdoor'],    price:'12.99', stock:60, badge:null,   averageRating:4.6, reviewCount:156, description:'2-litre copper-finish watering can with long narrow spout — perfect for indoor plants.' },

].map(p => ({ ...p, imageUrl: img(p.name) }));

const SECTIONS = {
  INDOOR_PLANT:   { title:'Indoor Plants',   icon:'/images/indoorplant.png',  eye:'For your home',   id:'indoor-plant' },
  OUTDOOR_PLANT:  { title:'Outdoor Plants',  icon:'/images/outdoorplant.png', eye:'For your garden', id:'outdoor-plant' },
  GARDENING_TOOL: { title:'Gardening Tools', icon:'/images/Tools_img.png',    eye:'Equip yourself',  id:'gardening-tool' },
};

export default function ShopSection({ filter, onAddToCart, toast, user }) {
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [offline, setOffline]     = useState(false);
  const [wishlist, setWishlist]   = useState(new Set());
  const [modal, setModal]         = useState(null);

  useEffect(() => {
    fetch(`${BASE}/products/all`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {

          const filteredData = data.filter(p =>
            ALLOWED_PRODUCTS.includes(p.name?.toLowerCase().trim())
          );

          setProducts(filteredData.map(p => ({
            ...p,
            price: p.price?.toString() || '0',
            tags: Array.isArray(p.tags) ? p.tags : [],
            badge: p.stock < 5 ? 'hot' : null,
            imageUrl: img(p.name),
          })));

          setOffline(false);
        } else {
          setProducts(FALLBACK);
          setOffline(true);
        }
      })
      .catch(() => { setProducts(FALLBACK); setOffline(true); })
      .finally(() => setLoading(false));
  }, []);

  const shown = useMemo(() => {
    let list = [...products];
    if (filter.category !== 'ALL') list = list.filter(p => p.category === filter.category);
    if (filter.keyword) {
      const kw = filter.keyword.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(kw) ||
        p.tags.some(t => t.toLowerCase().includes(kw)) ||
        (p.description||'').toLowerCase().includes(kw));
    }
    if (filter.minPrice)    list = list.filter(p => +p.price >= +filter.minPrice);
    if (filter.maxPrice)    list = list.filter(p => +p.price <= +filter.maxPrice);
    if (filter.inStockOnly) list = list.filter(p => (p.stock||0) > 0);
    switch (filter.sortBy) {
      case 'price_asc':  list.sort((a,b)=>+a.price-+b.price); break;
      case 'price_desc': list.sort((a,b)=>+b.price-+a.price); break;
      case 'name':       list.sort((a,b)=>a.name.localeCompare(b.name)); break;
      case 'rating':     list.sort((a,b)=>(b.averageRating||0)-(a.averageRating||0)); break;
      default: break;
    }
    return list;
  }, [products, filter]);

  const addToCart = async (p) => {
    if (!user)   { toast('Please sign in to add items to basket 🌿'); return; }
    if (offline) { toast('Backend offline — start backend to use cart', 'err'); return; }
    try { await onAddToCart(p.id); toast(`${p.name} added to basket! 🛒`); }
    catch (e) { toast(e.message || 'Could not add. Try again.', 'err'); }
  };

  const toggleWish = async (id) => {
    if (!user)   { toast('Sign in to save to wishlist'); return; }
    if (offline) { toast('Wishlist needs backend running', 'err'); return; }
    const tk = localStorage.getItem('gn_token');
    try {
      await fetch(`${BASE}/wishlist/toggle/${id}`,
        { method:'POST', headers:{ Authorization:`Bearer ${tk}` } });
      setWishlist(prev => {
        const s = new Set(prev);
        s.has(id) ? (s.delete(id), toast('Removed from wishlist'))
                  : (s.add(id),    toast('Added to wishlist ❤️'));
        return s;
      });
    } catch {}
  };

  if (loading) return (
    <section className="plant-section">
      <div className="container">
        <div className="plant-grid">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="card-container">
              <div className="skeleton" style={{height:210}}/>
              <div className="card-body">
                <div className="skeleton" style={{height:18,width:'60%',marginBottom:8}}/>
                <div className="skeleton" style={{height:14,width:'80%'}}/>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const filtered = filter.category !== 'ALL' || filter.keyword
                || filter.minPrice || filter.maxPrice;

  const Grid = ({ items }) => (
    <div className="plant-grid">
      {items.map(p => (
        <PlantCard key={p.id} product={p}
          inWishlist={wishlist.has(p.id)}
          onAddToCart={() => addToCart(p)}
          onWishlist={()  => toggleWish(p.id)}
          onDetails={()   => setModal(p)} />
      ))}
    </div>
  );

  return (
    <>
      {offline && (
        <div style={{background:'#fef3c7',borderTop:'2px solid #f59e0b',
          padding:'10px 0',textAlign:'center'}}>
          <div className="container">
            <span style={{fontSize:'.82rem',color:'#92400e',fontWeight:600}}>
              ⚠️ Backend offline — showing demo products. Start the backend to enable cart &amp; checkout.
            </span>
          </div>
        </div>
      )}

      {filtered ? (
        <section className="plant-section page-fade" id="shop">
          <div className="container">
            <div className="section-hd">
              <div>
                <div className="section-eye">
                  {filter.keyword ? `Results for "${filter.keyword}"` : 'Filtered results'}
                </div>
                <h2 style={{fontSize:'1.9rem',color:'var(--g-deep)'}}>
                  {shown.length} product{shown.length!==1?'s':''} found
                </h2>
              </div>
              <span style={{fontSize:'.82rem',color:'var(--text-soft)'}}>
                {products.length} total
              </span>
            </div>
            {shown.length===0
              ? <div className="empty-state">
                  <div className="empty-state-icon">🌿</div>
                  <h3>No products found</h3>
                  <p>Try adjusting your filters or search term</p>
                </div>
              : <Grid items={shown}/>}
          </div>
        </section>
      ) : (
        ['INDOOR_PLANT','OUTDOOR_PLANT','GARDENING_TOOL'].map(cat => {
          const s = SECTIONS[cat];
          const items = shown.filter(p => p.category === cat);
          return (
            <section key={cat} className="plant-section" id={s.id}>
              <div className="container">
                <div className="section-hd">
                  <div>
                    <div className="section-eye">{s.eye}</div>
                    <h2>
                      <img src={s.icon} alt={s.title} className="plant-icon"/>
                      {s.title}
                    </h2>
                  </div>
                  <span style={{color:'var(--g-mid)',fontSize:'.85rem',fontWeight:600}}>
                    {items.length} varieties
                  </span>
                </div>
                {items.length===0
                  ? <p style={{color:'var(--text-soft)'}}>No products yet.</p>
                  : <Grid items={items}/>}
              </div>
            </section>
          );
        })
      )}

      {modal && (
        <ProductModal product={modal}
          inWishlist={wishlist.has(modal.id)}
          onClose={()     => setModal(null)}
          onAddToCart={()  => { addToCart(modal); setModal(null); }}
          onWishlist={()   => toggleWish(modal.id)}
          user={user} toast={toast}/>
      )}
    </>
  );
}
