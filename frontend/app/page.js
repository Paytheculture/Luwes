'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { api, isLoggedIn, formatRupiah, formatDate } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pesanan, setPesanan] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push('/login');
      return;
    }
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

  const now = new Date();
  const thisMonth = pesanan.filter((p) => {
    const d = new Date(p.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const active = pesanan.filter((p) => p.status === 'Terpasang' || p.status === 'Lunas');
  const revenue = thisMonth.reduce((sum, p) => sum + (p.total_harga || 0), 0);
  const recent = [...pesanan].reverse().slice(0, 8);

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

  if (loading) {
    return (
      <div className="app-layout">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="main-content">
          <div className="page-loading"><div className="loading-spinner" /></div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="main-content">
        <div className="page-header">
          <div>
            <h2>Dashboard</h2>
            <p>Ringkasan pesanan dekorasi bulan ini</p>
          </div>
          <Link href="/pesanan/tambah" className="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Pesanan baru
          </Link>
        </div>

        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-label">Pesanan bulan ini</div>
            <div className="stat-value">{thisMonth.length}</div>
            <div className="stat-sub">dari total {pesanan.length} pesanan</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Sedang aktif</div>
            <div className="stat-value">{active.length}</div>
            <div className="stat-sub">terpasang atau sudah lunas</div>
          </div>
        </div>

        <div className="table-container">
          <div className="table-toolbar">
            <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, flex: 1 }}>Pesanan terbaru</h3>
            <Link href="/pesanan" className="btn btn-secondary btn-sm">Lihat semua</Link>
          </div>

          {recent.length === 0 ? (
            <div className="table-empty">Belum ada pesanan. Klik "Pesanan baru" untuk mulai.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Pengantin</th>
                  <th>Tanggal pasang</th>
                  <th>Tanggal bongkar</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((p) => (
                  <tr
                    key={p.id}
                    className="clickable-row"
                    onClick={() => router.push(`/pesanan/${p.id}`)}
                  >
                    <td style={{ fontWeight: 500 }}>{p.nama_pengantin}</td>
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
