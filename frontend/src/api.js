const BASE_URL = 'https://greennest-production.up.railway.app/api';

function getToken() {
  return localStorage.getItem('gn_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  // Auth
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login:    (data) => request('/auth/login',    { method: 'POST', body: JSON.stringify(data) }),

  // Products
  getProducts:   (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/products${qs ? '?' + qs : ''}`);
  },
  getProduct: (id) => request(`/products/${id}`),

  // Cart
  getCart:    ()                           => request('/cart'),
  addToCart:  (productId, quantity = 1)   => request('/cart/add',              { method:'POST',   body: JSON.stringify({ productId, quantity }) }),
  updateCart: (cartItemId, quantity)       => request(`/cart/update/${cartItemId}`, { method:'PUT',  body: JSON.stringify({ quantity }) }),
  removeCart: (cartItemId)                => request(`/cart/remove/${cartItemId}`, { method:'DELETE' }),

  // Orders
  checkout:      (shippingAddress) => request('/orders/checkout', { method:'POST', body: JSON.stringify({ shippingAddress }) }),
  getOrders:     ()                => request('/orders'),

  // Testimonials
  getTestimonials: () => request('/testimonials'),
  submitTestimonial: (data) => request('/testimonials', { method:'POST', body: JSON.stringify(data) }),
};

export default api;
