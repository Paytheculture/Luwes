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
  let targetUrl = '';
  try {
    targetUrl = encodeURI(`${API_URL}${path}`);
    res = await fetch(targetUrl, {
      ...options,
      headers,
    });
  } catch (err) {
    console.error(`[API FETCH ERROR] Network error for ${targetUrl}:`, err);
    throw new Error('Gagal terhubung ke server backend. Pastikan server backend online dan URL backend diatur dengan benar.');
  }

  if (res.status === 401) {
    removeToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const textData = await res.text();
    console.error(`[API ERROR] Expected JSON but got ${contentType} for ${targetUrl}. Status: ${res.status}. Body:`, textData.substring(0, 500));
    throw new Error(`Server API Error (${res.status}): Path ${path} tidak mengembalikan data JSON yang valid. Silakan cek URL Backend.`);
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
