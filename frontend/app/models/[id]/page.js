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
  });

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); return; }
    loadData();
  }, []);

  async function loadData() {
    try {
      const res = await api('/api/models');
      const item = res.data.find(i => i.id === params.id);
      if (item) {
        setForm({
          nama: item.nama,
          deskripsi: item.deskripsi || '',
          gambar_url: item.gambar_url || '',
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
      await api(`/api/models/${params.id}`, {
        method: 'PUT',
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
            <h2>Edit Model Dekorasi</h2>
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
              <label htmlFor="nama">Nama Model Dekorasi</label>
              <input
                id="nama"
                type="text"
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                required
              />
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
