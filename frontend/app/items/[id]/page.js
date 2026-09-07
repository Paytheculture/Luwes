'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import ImageUpload from '@/components/ImageUpload';
import { api, isLoggedIn } from '@/lib/api';

export default function EditItemPage() {
  const router = useRouter();
  const params = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    nama: '',
    deskripsi: '',
    gambar_url: '',
    kategori: '',
  });

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); return; }
    loadData();
  }, []);

  async function loadData() {
    try {
      const res = await api('/api/items');
      const item = res.data.find(i => i.id === params.id);
      if (item) {
        setForm({
          nama: item.nama,
          deskripsi: item.deskripsi || '',
          gambar_url: item.gambar_url || '',
          kategori: item.kategori || '',
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api(`/api/items/${params.id}`, {
        method: 'PUT',
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
            <h2>Edit item</h2>
            <p>ID: {params.id}</p>
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

              <div className="form-group">
                <label htmlFor="nama">Nama item</label>
                <input
                  id="nama"
                  type="text"
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="kategori">Tim / Kategori</label>
                <select
                  id="kategori"
                  value={form.kategori}
                  onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                  required
                >
                  <option value="" disabled>Pilih Tim / Kategori</option>
                  <option value="Tim Pelaminan">Tim Pelaminan</option>
                  <option value="Tim Tenda">Tim Tenda</option>
                  <option value="Tim Bunga">Tim Bunga</option>
                  <option value="Tim Properti">Tim Properti</option>
                </select>
              </div>

            <div className="form-group">
              <label htmlFor="deskripsi">Deskripsi</label>
              <textarea
                id="deskripsi"
                rows="4"
                value={form.deskripsi}
                onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
              />
            </div>

            <div className="form-actions">
              <Link href="/items" className="btn btn-secondary">Batal</Link>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <span className="loading-spinner" /> : 'Simpan perubahan'}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
