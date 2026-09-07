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
    kategori: '',
  });

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); }
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api('/api/items', {
        method: 'POST',
        body: JSON.stringify({
          nama: form.nama,
          deskripsi: form.deskripsi,
          gambar_url: form.gambar_url,
          kategori: form.kategori,
        }),
      });
      router.push('/items');
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
            <h2>Tambah item baru</h2>
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
                <label htmlFor="nama">Nama item</label>
                <input
                  id="nama"
                  type="text"
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  placeholder="Contoh: Kursi Tiffany Gold"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="kategori">Tim / Kategori</label>
                <input
                  id="kategori"
                  type="text"
                  list="tim-kategori"
                  value={form.kategori}
                  onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                  placeholder="Contoh: Tim Tenda"
                  required
                />
                <datalist id="tim-kategori">
                  <option value="Tim Pelaminan" />
                  <option value="Tim Tenda" />
                  <option value="Tim Bunga" />
                  <option value="Tim Properti" />
                </datalist>
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
