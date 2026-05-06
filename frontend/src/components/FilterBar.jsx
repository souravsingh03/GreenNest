import React, { useState } from "react";

const CATS = [
  { key:'ALL',            label:'All' },
  { key:'INDOOR_PLANT',   label:'Indoor' },
  { key:'OUTDOOR_PLANT',  label:'Outdoor' },
  { key:'GARDENING_TOOL', label:'Tools' },
];

const SORTS = [
  { value:'newest',     label:'Newest First' },
  { value:'price_asc',  label:'Price: Low → High' },
  { value:'price_desc', label:'Price: High → Low' },
  { value:'name',       label:'Name A–Z' },
  { value:'rating',     label:'Top Rated' },
];

export default function FilterBar({ filter, onChange }) {
  const [showPrice, setShowPrice] = useState(false);
  const set = (k, v) => onChange(p => ({ ...p, [k]: v }));
  const hasActive = filter.keyword || filter.minPrice || filter.maxPrice || filter.inStockOnly;

  return (
    <div className="filter-section">
      <div className="container">
        <div className="filter-inner">

          {/* Category — NO emoji */}
          <div className="filter-tabs">
            {CATS.map(c => (
              <button key={c.key}
                className={`filter-tab ${filter.category===c.key?'active':''}`}
                onClick={() => set('category', c.key)}>
                {c.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="search-box">
            <span style={{ color:'var(--text-soft)' }}>🔍</span>
            <input
              placeholder="Search plants, tools…"
              value={filter.keyword}
              onChange={e => set('keyword', e.target.value)}
            />
            {filter.keyword && (
              <button onClick={() => set('keyword', '')}
                style={{ background:'none', border:'none', cursor:'pointer', color:'#888' }}>✕</button>
            )}
          </div>

          {/* Price toggle */}
          <button
            className={`filter-tab ${showPrice?'active':''}`}
            onClick={() => setShowPrice(p=>!p)}
            style={{ whiteSpace:'nowrap' }}>
            Price {(filter.minPrice || filter.maxPrice) ? '●' : ''}
          </button>

          {/* In Stock */}
          <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:'.82rem',
            fontWeight:600, color:filter.inStockOnly?'var(--g-mid)':'var(--text-soft)',
            cursor:'pointer', whiteSpace:'nowrap' }}>
            <input type="checkbox" checked={!!filter.inStockOnly}
              onChange={e => set('inStockOnly', e.target.checked)}
              style={{ accentColor:'var(--g-mid)', width:15, height:15 }}/>
            In Stock Only
          </label>

          {/* Sort */}
          <select className="sort-select" value={filter.sortBy}
            onChange={e => set('sortBy', e.target.value)}>
            {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          {/* Clear */}
          {hasActive && (
            <button className="btn btn-ghost btn-sm"
              onClick={() => onChange({ category:'ALL', keyword:'', sortBy:'newest',
                minPrice:'', maxPrice:'', inStockOnly:false })}>
              ✕ Clear
            </button>
          )}
        </div>

        {showPrice && (
          <div style={{ display:'flex', alignItems:'center', gap:10,
            padding:'10px 0 4px', borderTop:'1px solid var(--border)', marginTop:8 }}>
            <span style={{ fontSize:'.82rem', color:'var(--text-mid)', fontWeight:600 }}>Price:</span>
            <div className="price-filter">
              <span>₹</span>
              <input type="number" placeholder="Min" value={filter.minPrice}
                onChange={e => set('minPrice', e.target.value)} min={0}/>
              <span>–</span>
              <input type="number" placeholder="Max" value={filter.maxPrice}
                onChange={e => set('maxPrice', e.target.value)} min={0}/>
            </div>
            {(filter.minPrice||filter.maxPrice) && (
              <button className="btn btn-ghost btn-sm"
                onClick={() => { set('minPrice',''); set('maxPrice',''); }}>Clear</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
