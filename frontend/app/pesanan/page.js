'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { api, isLoggedIn, formatRupiah, formatDate } from '@/lib/api';

export default function PesananListPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pesanan, setPesanan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); return; }
    loadData();
  }, []);

  async function loadData() {
    try {
      const res = await api('/api/pesanan');
      setPesanan(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = pesanan.filter((p) => {
    const matchSearch = !search || p.nama_pengantin.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  function getBadgeClass(status) {
    const map = {
      Pending: 'badge-pending',
      Lunas: 'badge-lunas',
      Terpasang: 'badge-terpasang',
      Selesai: 'badge-selesai',
      Batal: 'badge-batal',
    };
    return map[status] || 'badge-pending';
  }

  return (
    <div className="app-layout">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="main-content">
        <div className="page-header">
          <div>
            <h2>Pesanan</h2>
            <p>{pesanan.length} pesanan tercatat</p>
          </div>
          <Link href="/pesanan/tambah" className="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Pesanan baru
          </Link>
        </div>

        <div className="table-container">
          <div className="table-toolbar">
            <input
              type="text"
              placeholder="Cari nama pengantin..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">Semua status</option>
              <option value="Pending">Pending</option>
              <option value="Lunas">Lunas</option>
              <option value="Terpasang">Terpasang</option>
              <option value="Selesai">Selesai</option>
              <option value="Batal">Batal</option>
            </select>
          </div>

          {loading ? (
            <div className="page-loading"><div className="loading-spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="table-empty">
              {search || statusFilter ? 'Pesanan tidak ditemukan.' : 'Belum ada pesanan.'}
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Pengantin</th>
                  <th>No HP</th>
                  <th>Tanggal pasang</th>
                  <th>Tanggal bongkar</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {[...filtered].reverse().map((p) => (
                  <tr
                    key={p.id}
                    className="clickable-row"
                    onClick={() => router.push(`/pesanan/${p.id}`)}
                  >
                    <td style={{ fontWeight: 500 }}>{p.nama_pengantin}</td>
                    <td>{p.no_hp || '-'}</td>
                    <td>{formatDate(p.tanggal_pasang)}</td>
                    <td>{formatDate(p.tanggal_bongkar)}</td>
                    <td><span className={`badge ${getBadgeClass(p.status)}`}>{p.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
