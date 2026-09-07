const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || '';
const API_URL = rawApiUrl.replace(/\/+$/, '');

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('luwes_token') || 'dummy_token';
}

export function setToken(token) {
  localStorage.setItem('luwes_token', token);
}

export function removeToken() {
  localStorage.removeItem('luwes_token');
}

export function isLoggedIn() {
  return true; // BYPASS LOGIN
}

export async function api(path, options = {}) {
  const token = getToken();
  
  const headers = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Don't set Content-Type for FormData (browser sets it with boundary)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });
  } catch (err) {
    console.error('Fetch API error:', err);
    throw new Error('Gagal terhubung ke server backend. Pastikan server backend online dan URL backend diatur dengan benar.');
  }

  if (res.status === 401) {
    removeToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  const data = await res.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Request gagal');
  }

  return data;
}

export function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}
