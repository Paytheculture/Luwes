'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import Modal from '@/components/Modal';
import { api, isLoggedIn, formatRupiah } from '@/lib/api';

export default function ItemsPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); return; }
    fetchModels();
  }, [router]);

  async function fetchModels() {
    try {
      const res = await api('/api/models');
      setItems(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!itemToDelete) return;
    try {
      await api(`/api/models/${itemToDelete.id}`, { method: 'DELETE' });
      fetchModels();
      setItemToDelete(null);
    } catch (err) {
      alert('Gagal menghapus: ' + err.message);
    }
  }

  const filtered = items.filter((i) => 
    !search || i.nama.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app-layout">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="main-content">
        <div className="page-header">
          <div>
            <h2 className="page-title">Model Dekorasi</h2>
            <p>{items.length} model tersedia di katalog</p>
          </div>
          <Link href="/models/tambah" className="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Tambah Model
          </Link>
        </div>

        <div className="card">
          <div className="table-toolbar" style={{ borderBottom: 'none', padding: '0 0 var(--sp-5) 0' }}>
            <input
              type="text"
              placeholder="Cari model dekorasi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: '400px' }}
            />
          </div>

          {loading ? (
            <div className="page-loading"><div className="loading-spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="table-empty">Model dekorasi tidak ditemukan.</div>
          ) : (
            <div className="item-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
              {filtered.map((item) => (
                <div key={item.id} className="item-card">
                  <div 
                    className="item-card-img" 
                    style={{ aspectRatio: '16/9', cursor: 'pointer' }}
                    onClick={() => router.push(`/items/${item.id}`)}
                  >
                    {item.gambar_url ? (
                      <img src={item.gambar_url} alt={item.nama} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
                        Belum ada foto
                      </div>
                    )}
                  </div>
                  <div className="item-card-body">
                    <h4 
                      style={{ cursor: 'pointer' }}
                      onClick={() => router.push(`/models/${item.id}`)}
                    >
                      {item.nama}
                    </h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--sp-2)' }}>

                      <button 
                        className="btn-icon" 
                        style={{ padding: '4px' }}
                        onClick={() => setItemToDelete(item)}
                        title="Hapus"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {itemToDelete && (
        <Modal
          title="Hapus item?"
          message={`Item "${itemToDelete.nama}" akan dihapus dari katalog. Pesanan yang sudah menggunakan item ini tidak akan terpengaruh.`}
          onConfirm={handleDelete}
          onCancel={() => setItemToDelete(null)}
        />
      )}
    </div>
  );
}
