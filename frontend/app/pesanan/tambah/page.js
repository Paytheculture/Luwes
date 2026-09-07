'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { api, isLoggedIn, formatRupiah } from '@/lib/api';

export default function TambahPesananPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    nama_pengantin: '',
    alamat: '',
    no_hp: '',
    tanggal_pasang: '',
    tanggal_bongkar: '',
    catatan: '',
    model_dekorasi: '',
    tema_warna: '',
    status: 'Pending',
  });

  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); return; }
    loadItems();
  }, []);

  async function loadItems() {
    try {
      const resItems = await api('/api/items');
      setItems(resItems.data || []);
    } catch (err) {
      console.error("Gagal load items:", err);
    }
    
    try {
      const resModels = await api('/api/models');
      setModels(resModels.data || []);
    } catch (err) {
      console.error("Gagal load models:", err);
    }
    
    setLoading(false);
  }

  function toggleItem(item) {
    const exists = selectedItems.find((s) => s.nama === item.nama);
    if (exists) {
      setSelectedItems(selectedItems.filter((s) => s.nama !== item.nama));
    } else {
      setSelectedItems([...selectedItems, {
        id: item.id,
        nama: item.nama,
        qty: 1,
        gambar: item.gambar_url || '',
      }]);
    }
  }

  function updateQty(id, delta) {
    setSelectedItems(selectedItems.map((s) => {
      if (s.id === id) {
        const newQty = Math.max(1, s.qty + delta);
        return { ...s, qty: newQty };
      }
      return s;
    }));
  }

  function removeItem(id) {
    setSelectedItems(selectedItems.filter((s) => s.id !== id));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    // Gunakan nilai custom jika modelnya "Lainnya"
    const modelFinal = form.model_dekorasi === 'Lainnya' ? form.model_dekorasi_custom : form.model_dekorasi;
    const modelGambar = models.find(m => m.nama === form.model_dekorasi)?.gambar_url || '';
    
    // Sisipkan model dan tema sebagai item pertama dan kedua
    const finalItems = [
      { id: 'model-dekorasi', nama: `Model Dekorasi: ${modelFinal}`, qty: 1, gambar: modelGambar },
      { id: 'tema-warna', nama: `Tema Warna/Bunga: ${form.tema_warna}`, qty: 1 },
      ...selectedItems
    ];

    setSaving(true);
    try {
      await api('/api/pesanan', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          items: finalItems,
        }),
      });
      router.push('/pesanan');
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
            <h2>Pesanan baru</h2>
            <p>Isi data pengantin dan pilih item dekorasi</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card" style={{ marginBottom: 'var(--sp-6)' }}>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--sp-5)' }}>
              Data pengantin
            </h3>

            <div className="form-group">
              <label htmlFor="nama">Nama pengantin</label>
              <input
                id="nama"
                type="text"
                value={form.nama_pengantin}
                onChange={(e) => setForm({ ...form, nama_pengantin: e.target.value })}
                placeholder="Contoh: Andi & Sari"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="alamat">Alamat pemasangan</label>
                <input
                  id="alamat"
                  type="text"
                  value={form.alamat}
                  onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                  placeholder="Jl. Mawar No. 10, Semarang"
                />
              </div>
              <div className="form-group">
                <label htmlFor="hp">No HP</label>
                <input
                  id="hp"
                  type="tel"
                  value={form.no_hp}
                  onChange={(e) => setForm({ ...form, no_hp: e.target.value })}
                  placeholder="08123456789"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="pasang">Tanggal pasang</label>
                <input
                  id="pasang"
                  type="date"
                  value={form.tanggal_pasang}
                  onChange={(e) => setForm({ ...form, tanggal_pasang: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="bongkar">Tanggal bongkar</label>
                <input
                  id="bongkar"
                  type="date"
                  value={form.tanggal_bongkar}
                  onChange={(e) => setForm({ ...form, tanggal_bongkar: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="catatan">Catatan</label>
              <textarea
                id="catatan"
                rows="3"
                value={form.catatan}
                onChange={(e) => setForm({ ...form, catatan: e.target.value })}
                placeholder="Catatan tambahan (opsional)"
              />
            </div>
          </div>

          <div className="card" style={{ marginBottom: 'var(--sp-6)' }}>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--sp-5)' }}>
              Spesifikasi Utama
            </h3>
            
            <div className="form-group">
              <label htmlFor="model">Model Dekorasi</label>
              <select
                id="model"
                value={form.model_dekorasi}
                onChange={(e) => setForm({ ...form, model_dekorasi: e.target.value })}
                required
              >
                <option value="">-- Pilih Model Dekorasi --</option>
                {models.map((m) => (
                  <option key={m.id} value={m.nama}>{m.nama}</option>
                ))}
                <option value="Lainnya">Lainnya / Custom</option>
              </select>
              
              {/* Tampilkan gambar model jika ada yang dipilih */}
              {form.model_dekorasi && models.find(m => m.nama === form.model_dekorasi)?.gambar_url && (
                <div style={{ marginTop: 'var(--sp-3)', borderRadius: 'var(--radius-md)', overflow: 'hidden', maxWidth: '300px' }}>
                  <img 
                    src={models.find(m => m.nama === form.model_dekorasi).gambar_url} 
                    alt={form.model_dekorasi}
                    style={{ width: '100%', height: 'auto', display: 'block' }} 
                  />
                </div>
              )}
              
              {/* Jika pilih lainnya, tampilkan input text */}
              {form.model_dekorasi === 'Lainnya' && (
                <input
                  type="text"
                  placeholder="Ketik model dekorasi custom..."
                  onChange={(e) => setForm({ ...form, model_dekorasi_custom: e.target.value })}
                  style={{ marginTop: 'var(--sp-2)' }}
                  required
                />
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="tema">Tema Warna / Bunga</label>
              <input
                id="tema"
                type="text"
                value={form.tema_warna}
                onChange={(e) => setForm({ ...form, tema_warna: e.target.value })}
                placeholder="Contoh: Putih & Peach, Mawar Merah"
                required
              />
            </div>
          </div>

          <div className="card" style={{ marginBottom: 'var(--sp-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-5)' }}>
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>
                Pilih item pendukung
              </h3>
            </div>

            {loading ? (
              <div className="page-loading"><div className="loading-spinner" /></div>
            ) : items.length === 0 ? (
              <div className="table-empty" style={{ padding: 'var(--sp-8)' }}>
                Belum ada item di katalog. <Link href="/items">Tambah item dulu.</Link>
              </div>
            ) : (
              <div className="item-grid">
                {items.map((item) => {
                  const isSelected = selectedItems.some((s) => s.id === item.id);
                  return (
                    <div
                      key={item.id}
                      className={`item-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleItem(item)}
                    >
                      <div className="item-card-img">
                        {item.gambar_url ? (
                          <img src={item.gambar_url} alt={item.nama} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
                            Belum ada foto
                          </div>
                        )}
                      </div>
                      <div className="item-card-body">
                        <h4>{item.nama}</h4>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {selectedItems.length > 0 && (
            <div className="card">
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--sp-3)' }}>
                Item terpilih
              </h3>

              <div className="selected-items">
                {selectedItems.map((item) => (
                  <div key={item.id} className="selected-item-row" style={{ display: 'flex', alignItems: 'center', padding: 'var(--sp-3)', borderBottom: '1px solid var(--border-color)' }}>
                    <div className="selected-item-thumb" style={{ width: '48px', height: '48px', background: 'var(--bg-elevated)', marginRight: 'var(--sp-3)' }}>
                      {item.gambar && <img src={item.gambar} alt={item.nama} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </div>
                    <div className="selected-item-info" style={{ flex: 1 }}>
                      <h5>{item.nama}</h5>
                      <div className="qty-control" style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                        <button type="button" onClick={() => updateQty(item.id, -1)}>−</button>
                        <span>{item.qty}</span>
                        <button type="button" onClick={() => updateQty(item.id, 1)}>+</button>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn-icon"
                      onClick={() => removeItem(item.id)}
                      title="Hapus item"
                      style={{ color: 'var(--danger-color)' }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

            </div>
          )}

          <div className="form-actions">
            <Link href="/pesanan" className="btn btn-secondary">Batal</Link>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <span className="loading-spinner" /> : 'Simpan pesanan'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
