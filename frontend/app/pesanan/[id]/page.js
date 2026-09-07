'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import Modal from '@/components/Modal';
import { api, isLoggedIn, formatRupiah, formatDate } from '@/lib/api';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import PesananExportTemplate from '@/components/PesananExportTemplate';

export default function PesananDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pesanan, setPesanan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [form, setForm] = useState({});
  const [exporting, setExporting] = useState(false);
  const exportRef = useRef(null);

  async function handleExport(type) {
    if (!exportRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(exportRef.current, { 
        scale: 2, 
        useCORS: true,
        logging: false 
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const filename = `Checklist_${pesanan.nama_pengantin.replace(/\s+/g, '_')}`;
      
      if (type === 'jpg') {
        const link = document.createElement('a');
        link.download = `${filename}.jpg`;
        link.href = imgData;
        link.click();
      } else if (type === 'pdf') {
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: [canvas.width / 2, canvas.height / 2]
        });
        pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width / 2, canvas.height / 2);
        pdf.save(`${filename}.pdf`);
      }
    } catch (err) {
      console.error(err);
      alert('Gagal mengekspor dokumen: ' + err.message);
    } finally {
      setExporting(false);
    }
  }

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); return; }
    loadData();
  }, []);

  async function loadData() {
    try {
      // Load pesanan dan katalog item secara bersamaan
      const [resPesanan, resItems] = await Promise.all([
        api(`/api/pesanan/${params.id}`),
        api('/api/items'),
      ]);

      const katalog = resItems.data || [];
      const katalogMap = {};
      katalog.forEach(k => { katalogMap[k.id] = k; });

      // Enrich items pesanan dengan kategori terbaru dari katalog
      const pesananData = resPesanan.data;
      if (pesananData.items) {
        pesananData.items = pesananData.items.map(item => {
          // item spesifikasi utama tidak perlu dicari di katalog
          if (item.id === 'model-dekorasi' || item.id === 'tema-warna') {
            return { ...item, kategori: 'Spesifikasi Utama' };
          }
          // ambil kategori terbaru dari katalog jika item tidak punya kategori
          const fromKatalog = katalogMap[item.id];
          if (fromKatalog && fromKatalog.kategori) {
            return { ...item, kategori: fromKatalog.kategori };
          }
          return item;
        });
      }

      setPesanan(pesananData);
      setForm(pesananData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await api(`/api/pesanan/${params.id}`, {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      setPesanan(form);
      setEditing(false);
    } catch (err) {
      alert('Gagal menyimpan: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await api(`/api/pesanan/${params.id}`, { method: 'DELETE' });
      router.push('/pesanan');
    } catch (err) {
      alert('Gagal menghapus: ' + err.message);
    }
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

  if (!pesanan) {
    return (
      <div className="app-layout">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="main-content">
          <div className="table-empty">Pesanan tidak ditemukan. <Link href="/pesanan">Kembali</Link></div>
        </main>
      </div>
    );
  }

  const statusOptions = ['Pending', 'Lunas', 'Terpasang', 'Selesai', 'Batal'];

  function getBadgeClass(status) {
    const map = {
      Pending: 'badge-pending', Lunas: 'badge-lunas', Terpasang: 'badge-terpasang',
      Selesai: 'badge-selesai', Batal: 'badge-batal',
    };
    return map[status] || 'badge-pending';
  }

  return (
    <div className="app-layout">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="main-content">
        <div className="page-header">
          <div>
            <h2>{pesanan.nama_pengantin}</h2>
            <p>ID: {pesanan.id}</p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
            {editing ? (
              <>
                <button className="btn btn-secondary" onClick={() => { setEditing(false); setForm(pesanan); }}>Batal</button>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? <span className="loading-spinner" /> : 'Simpan'}
                </button>
              </>
            ) : (
              <>
                <button className="btn btn-secondary" onClick={() => handleExport('jpg')} disabled={exporting}>
                  {exporting ? '...' : 'JPG'}
                </button>
                <button className="btn btn-secondary" onClick={() => handleExport('pdf')} disabled={exporting}>
                  {exporting ? '...' : 'PDF'}
                </button>
                <button className="btn btn-secondary" onClick={() => setEditing(true)}>Edit</button>
                <button className="btn btn-danger" onClick={() => setShowDelete(true)}>Hapus</button>
              </>
            )}
          </div>
        </div>

        <div className="card" style={{ marginBottom: 'var(--sp-6)' }}>
          {editing ? (
            <>
              <div className="form-group">
                <label>Nama pengantin</label>
                <input value={form.nama_pengantin} onChange={(e) => setForm({ ...form, nama_pengantin: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Alamat</label>
                  <input value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>No HP</label>
                  <input value={form.no_hp} onChange={(e) => setForm({ ...form, no_hp: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Tanggal pasang</label>
                  <input type="date" value={form.tanggal_pasang} onChange={(e) => setForm({ ...form, tanggal_pasang: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Tanggal bongkar</label>
                  <input type="date" value={form.tanggal_bongkar} onChange={(e) => setForm({ ...form, tanggal_bongkar: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Catatan</label>
                <textarea rows="3" value={form.catatan || ''} onChange={(e) => setForm({ ...form, catatan: e.target.value })} />
              </div>
            </>
          ) : (
            <div className="detail-grid">
              <div>
                <dl className="detail-field">
                  <dt>Nama pengantin</dt>
                  <dd>{pesanan.nama_pengantin}</dd>
                </dl>
                <dl className="detail-field">
                  <dt>Alamat</dt>
                  <dd>{pesanan.alamat || '-'}</dd>
                </dl>
                <dl className="detail-field">
                  <dt>No HP</dt>
                  <dd>{pesanan.no_hp || '-'}</dd>
                </dl>
              </div>
              <div>
                <dl className="detail-field">
                  <dt>Tanggal pasang</dt>
                  <dd>{formatDate(pesanan.tanggal_pasang)}</dd>
                </dl>
                <dl className="detail-field">
                  <dt>Tanggal bongkar</dt>
                  <dd>{formatDate(pesanan.tanggal_bongkar)}</dd>
                </dl>
                <dl className="detail-field">
                  <dt>Status</dt>
                  <dd><span className={`badge ${getBadgeClass(pesanan.status)}`}>{pesanan.status}</span></dd>
                </dl>
              </div>
            </div>
          )}

          {pesanan.catatan && !editing && (
            <dl className="detail-field" style={{ marginTop: 'var(--sp-4)', paddingTop: 'var(--sp-4)', borderTop: '1px solid var(--border-subtle)' }}>
              <dt>Catatan</dt>
              <dd style={{ color: 'var(--text-secondary)' }}>{pesanan.catatan}</dd>
            </dl>
          )}
        </div>

        <div className="card">
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--sp-4)' }}>
            Item dekorasi
          </h3>

          {pesanan.items && pesanan.items.length > 0 ? (
            <div className="selected-items">
              {pesanan.items.map((item, idx) => (
                <div key={idx} className="selected-item-row">
                  <div className="selected-item-thumb">
                    {item.gambar ? (
                      <img src={item.gambar} alt={item.nama} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: 'var(--bg-elevated)' }} />
                    )}
                  </div>
                  <div className="order-item-info">
                    <h5>{item.nama}</h5>
                    <span>Kuantitas: {item.qty}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Tidak ada item.</p>
          )}

        </div>
      </main>

      {showDelete && (
        <Modal
          title="Hapus pesanan?"
          message={`Pesanan atas nama "${pesanan.nama_pengantin}" akan dihapus permanen dari Google Sheets.`}
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
        />
      )}

      {/* Hidden Export Template */}
      <PesananExportTemplate pesanan={pesanan} ref={exportRef} />
    </div>
  );
}
