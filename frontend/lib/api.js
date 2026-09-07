const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
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

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

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
