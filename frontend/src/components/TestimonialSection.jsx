import React, { useEffect, useState } from "react";

const FALLBACK = [
  { id:1, authorName:'Jane D.',  quote:'GreenNest transformed my home with beautiful plants! The eco-packaging was stunning.', rating:5 },
  { id:2, authorName:'Mark S.',  quote:'Fast delivery and every plant arrived perfectly healthy. Will definitely order again!', rating:5 },
  { id:3, authorName:'Sarah L.', quote:'Superb customer service. My snake plant is thriving two months later!', rating:5 },
];

export default function TestimonialSection() {
  const [list, setList] = useState(FALLBACK);
  useEffect(() => {
    fetch('https://greennest-production.up.railway.app/api/testimonials')
      .then(r => r.json())
      .then(d => { if (Array.isArray(d) && d.length) setList(d); })
      .catch(() => {});
  }, []);

  return (
    <section className="testimonial-section">
      <div className="container">
        <span className="test-eye">Customer love</span>
        <h2>What our customers say</h2>
        <div className="test-grid">
          {list.map(t => (
            <div key={t.id} className="test-card">
              <div className="test-stars">{'★'.repeat(t.rating||5)}{'☆'.repeat(5-(t.rating||5))}</div>
              <p className="test-quote">"{t.quote}"</p>
              <div className="test-author">
                <div className="test-avatar">{(t.authorName||'?')[0].toUpperCase()}</div>
                <span className="test-name">{t.authorName||'Anonymous'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
