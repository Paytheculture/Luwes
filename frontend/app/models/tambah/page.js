'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import ImageUpload from '@/components/ImageUpload';
import { api, isLoggedIn } from '@/lib/api';

export default function TambahItemPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    nama: '',
    deskripsi: '',
    gambar_url: '',
  });

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); }
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api('/api/models', {
        method: 'POST',
        body: JSON.stringify({
          nama: form.nama,
          deskripsi: form.deskripsi,
          gambar_url: form.gambar_url,
        }),
      });
      router.push('/models');
    } catch (err) {
      alert('Gagal menyimpan: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="app-layout">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="main-content">
        <div className="page-header">
          <div>
            <h2>Tambah Model Dekorasi</h2>
            <p>Masukkan detail dekorasi ke dalam katalog</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card">
            <div className="form-group">
              <label>Foto item</label>
              <ImageUpload
                value={form.gambar_url}
                onChange={(url) => setForm({ ...form, gambar_url: url })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nama">Nama Model Dekorasi</label>
                <input
                  id="nama"
                  type="text"
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  placeholder="Contoh: Kursi Tiffany Gold"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="deskripsi">Deskripsi</label>
              <textarea
                id="deskripsi"
                rows="4"
                value={form.deskripsi}
                onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                placeholder="Spesifikasi, bahan, atau ukuran (opsional)"
              />
            </div>

            <div className="form-actions">
              <Link href="/items" className="btn btn-secondary">Batal</Link>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <span className="loading-spinner" /> : 'Simpan item'}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
