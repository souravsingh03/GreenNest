import React, { useState, useEffect } from "react";

const BASE = 'https://greennest-production.up.railway.app/api';

export default function HeroSection({ onAuth, modeRef }) {
  const [mode, setMode]       = useState('signup');
  const [form, setForm]       = useState({ name:'', email:'', password:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  // Expose setMode to parent via modeRef so Header buttons can switch form mode
  useEffect(() => {
    if (modeRef) modeRef.current = (m) => { setMode(m); setError(''); };
  }, [modeRef]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async () => {
    setError('');
    if (!form.email || !form.password) { setError('Email and password are required.'); return; }
    if (mode === 'signup' && !form.name.trim()) { setError('Name is required.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      const url  = `${BASE}/auth/${mode === 'signup' ? 'register' : 'login'}`;
      const body = mode === 'signup'
        ? { name: form.name, email: form.email, password: form.password }
        : { email: form.email, password: form.password };
      const res  = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || data.message || 'Something went wrong.'); return; }
      localStorage.setItem('gn_token', data.token);
      localStorage.setItem('gn_user', JSON.stringify({ name:data.name, email:data.email, role:data.role }));
      onAuth({ name:data.name, email:data.email, role:data.role });
    } catch {
      setError('Cannot connect to server. Make sure the backend is running on port 8080.');
    } finally { setLoading(false); }
  };

  return (
    <section className="hero">
      <div className="hero-bg" />
      <div className="container">
        <div className="hero-inner">
          <div className="hero-text">
            <div className="hero-badge">🌿 Eco-Friendly Delivery</div>
            <h1>Bring Nature<br/>Into Your Home</h1>
            <p>Handpicked plants delivered fresh to your door, wrapped in 100% sustainable packaging.</p>
            <div className="hero-cta">
              <a href="#indoor-plant"
                onClick={e => { e.preventDefault(); document.getElementById('indoor-plant')?.scrollIntoView({ behavior:'smooth' }); }}
                className="btn btn-primary btn-lg">Shop Plants</a>
              <a href="#gardening-tool"
                onClick={e => { e.preventDefault(); document.getElementById('gardening-tool')?.scrollIntoView({ behavior:'smooth' }); }}
                className="btn btn-outline btn-lg"
                style={{ color:'#fff', borderColor:'rgba(255,255,255,.5)' }}>View Tools</a>
            </div>
            <div className="hero-stats">
              <div><span className="stat-num">2,400+</span><span className="stat-lbl">Happy customers</span></div>
              <div><span className="stat-num">150+</span><span className="stat-lbl">Plant varieties</span></div>
              <div><span className="stat-num">100%</span><span className="stat-lbl">Eco packaging</span></div>
            </div>
          </div>

          <div className="hero-form-wrap">
            <div className="form-card">
              <h2>{mode === 'signup' ? 'Start for free' : 'Welcome back'}</h2>
              <p className="form-sub">
                {mode === 'signup' ? 'Join thousands of plant lovers' : 'Sign in to your account'}
              </p>
              {error && <div className="form-err">⚠️ {error}</div>}
              {mode === 'signup' && (
                <div className="f-group">
                  <input type="text" placeholder=" " value={form.name}
                    onChange={e => set('name', e.target.value)} />
                  <label>Full name</label>
                </div>
              )}
              <div className="f-group">
                <input type="email" placeholder=" " value={form.email}
                  onChange={e => set('email', e.target.value)} />
                <label>Email address</label>
              </div>
              <div className="f-group">
                <input type="password" placeholder=" " value={form.password}
                  onChange={e => set('password', e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && submit()} />
                <label>Password</label>
              </div>
              <button className="btn btn-primary f-submit" onClick={submit} disabled={loading}>
                {loading ? '⏳ Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}
              </button>
              <span className="f-switch">
                {mode === 'signup' ? 'Already have an account? ' : 'New here? '}
                <button onClick={() => { setMode(m => m === 'signup' ? 'login' : 'signup'); setError(''); }}>
                  {mode === 'signup' ? 'Sign in' : 'Create account'}
                </button>
              </span>
              <div className="divider">or</div>
              <div className="social-btns">
                <button className="btn btn-social"> Continue with Google</button>
                <button className="btn btn-social"> Continue with Facebook</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
