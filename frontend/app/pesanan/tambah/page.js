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
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [itemSearch, setItemSearch] = useState('');

  const CATEGORY_ICONS = {
    Lampu: '💡',
    Kursi: '🪑',
    Panggung: '🎪',
    Bunga: '🌸',
    Meja: '🪵',
    Tenda: '⛺',
    Karpet: '🧶',
    Kipas: '🌀',
    Sound: '🔊',
    Lainnya: '📦',
  };

  function getItemCategory(item) {
    if (item.kategori && item.kategori.trim()) {
      return item.kategori.trim();
    }
    const name = (item.nama || '').trim();
    if (!name) return 'Lainnya';
    const firstWord = name.split(/\s+/)[0];
    if (!firstWord) return 'Lainnya';
    return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
  }

  function getCategoryIcon(cat) {
    return CATEGORY_ICONS[cat] || '✨';
  }

  const groupedItems = items.reduce((acc, item) => {
    const cat = getItemCategory(item);
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const categoryList = Object.keys(groupedItems).sort();

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

  function handleAdd(item) {
    const exists = selectedItems.find((s) => s.id === item.id);
    if (!exists) {
      setSelectedItems([...selectedItems, {
        id: item.id,
        nama: item.nama,
        qty: 1,
        gambar: item.gambar_url || '',
      }]);
    }
  }

  function updateQty(id, delta) {
    setSelectedItems(prev => {
      const existing = prev.find(s => s.id === id);
      if (!existing) return prev;
      
      const currentQty = parseInt(existing.qty) || 0;
      const newQty = currentQty + delta;
      
      if (newQty <= 0) {
        return prev.filter(s => s.id !== id);
      }
      return prev.map(s => s.id === id ? { ...s, qty: newQty } : s);
    });
  }

  function handleQtyChange(id, value) {
    setSelectedItems(prev => {
      const existing = prev.find(s => s.id === id);
      if (!existing) return prev;
      
      // Allow empty string for intermediate typing
      const newQty = value === '' ? '' : parseInt(value) || 0;
      
      return prev.map(s => s.id === id ? { ...s, qty: newQty } : s);
    });
  }

  function handleQtyBlur(id) {
    setSelectedItems(prev => {
      const existing = prev.find(s => s.id === id);
      if (!existing) return prev;
      
      if (existing.qty === '' || existing.qty <= 0) {
        return prev.filter(s => s.id !== id);
      }
      return prev;
    });
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

"          <div className="card" style={{ marginBottom: 'var(--sp-6)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', marginBottom: 'var(--sp-5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--sp-3)' }}>
                <div>
                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, margin: 0 }}>
                    Pilih item pendukung
                  </h3>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                    Terbagi rapi per kategori agar mudah dipilih tanpa bingung
                  </p>
                </div>

                {/* Search Bar */}
                <div style={{ position: 'relative', width: '220px', maxWidth: '100%' }}>
                  <input
                    type="text"
                    placeholder="Cari item..."
                    value={itemSearch}
                    onChange={(e) => setItemSearch(e.target.value)}
                    style={{
                      width: '100%',
                      paddingLeft: '32px',
                      paddingRight: itemSearch ? '28px' : '12px',
                      fontSize: 'var(--text-xs)',
                      height: '36px',
                      borderRadius: 'var(--radius-md)'
                    }}
                  />
                  <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '13px', pointerEvents: 'none' }}>
                    🔍
                  </span>
                  {itemSearch && (
                    <button
                      type="button"
                      onClick={() => setItemSearch('')}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '12px',
                        padding: '2px'
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Category Filter Pills */}
              {categoryList.length > 0 && (
                <div className="category-tabs-container">
                  <button
                    type="button"
                    className={`category-tab-btn ${selectedCategory === 'Semua' ? 'active' : ''}`}
                    onClick={() => setSelectedCategory('Semua')}
                  >
                    <span>Semua</span>
                    <span className="category-tab-badge">{items.length}</span>
                  </button>

                  {categoryList.map((cat) => {
                    const totalCount = groupedItems[cat].length;
                    const selectedInCat = groupedItems[cat].filter(i => selectedItems.some(s => s.id === i.id)).length;
                    return (
                      <button
                        key={cat}
                        type="button"
                        className={`category-tab-btn ${selectedCategory === cat ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(cat)}
                      >
                        <span>{getCategoryIcon(cat)} {cat}</span>
                        <span className="category-tab-badge">{totalCount}</span>
                        {selectedInCat > 0 && (
                          <span 
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background: selectedCategory === cat ? '#ffffff' : 'var(--primary-color)',
                              display: 'inline-block'
                            }} 
                            title={`${selectedInCat} item dipilih`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {loading ? (
              <div className="page-loading"><div className="loading-spinner" /></div>
            ) : items.length === 0 ? (
              <div className="table-empty" style={{ padding: 'var(--sp-8)' }}>
                Belum ada item di katalog. <Link href="/items">Tambah item dulu.</Link>
              </div>
            ) : (
              <div>
                {categoryList
                  .filter((cat) => selectedCategory === 'Semua' || selectedCategory === cat)
                  .map((cat) => {
                    const categoryItems = groupedItems[cat].filter((item) =>
                      !itemSearch || item.nama.toLowerCase().includes(itemSearch.toLowerCase())
                    );

                    if (categoryItems.length === 0) return null;

                    const selectedInCat = categoryItems.filter(i => selectedItems.some(s => s.id === i.id)).length;

                    return (
                      <div key={cat} className="category-section">
                        <div className="category-header">
                          <div className="category-header-title">
                            <span style={{ fontSize: '18px' }}>{getCategoryIcon(cat)}</span>
                            <span>{cat}</span>
                            <span className="category-header-meta">
                              ({categoryItems.length} item)
                            </span>
                          </div>
                          {selectedInCat > 0 && (
                            <span className="badge badge-lunas" style={{ fontSize: '11px', padding: '2px 8px' }}>
                              {selectedInCat} dipilih
                            </span>
                          )}
                        </div>

                        <div className="item-grid">
                          {categoryItems.map((item) => {
                            const selectedItem = selectedItems.find((s) => s.id === item.id);
                            const isSelected = !!selectedItem;
                            return (
                              <div
                                key={item.id}
                                className={`item-card ${isSelected ? 'selected' : ''}`}
                                style={{ display: 'flex', flexDirection: 'column' }}
                              >
                                <div className="item-card-img" onClick={() => !isSelected && handleAdd(item)} style={{ cursor: isSelected ? 'default' : 'pointer' }}>
                                  {item.gambar_url ? (
                                    <img src={item.gambar_url} alt={item.nama} />
                                  ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
                                      Belum ada foto
                                    </div>
                                  )}
                                </div>
                                <div className="item-card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                  <h4 style={{ marginBottom: 'var(--sp-3)' }}>{item.nama}</h4>
                                  
                                  {isSelected ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                                      <div style={{ position: 'relative', flex: 1 }}>
                                        <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '12px', fontWeight: '500', pointerEvents: 'none' }}>Qty:</span>
                                        <input 
                                          type="number" 
                                          min="0"
                                          value={selectedItem.qty} 
                                          onChange={(e) => handleQtyChange(item.id, e.target.value)}
                                          onBlur={() => handleQtyBlur(item.id)}
                                          style={{ 
                                            width: '100%', 
                                            textAlign: 'right', 
                                            fontWeight: '600', 
                                            border: '2px solid var(--primary-color)', 
                                            borderRadius: 'var(--radius-md)', 
                                            padding: '6px 10px 6px 36px', 
                                            outline: 'none', 
                                            background: 'rgba(var(--primary-color-rgb), 0.05)',
                                            color: 'var(--primary-color)',
                                            fontSize: '14px'
                                          }}
                                        />
                                      </div>
                                      <button 
                                        type="button" 
                                        onClick={() => removeItem(item.id)} 
                                        style={{ 
                                          background: 'none', 
                                          border: 'none', 
                                          color: 'var(--danger-color)', 
                                          cursor: 'pointer', 
                                          padding: '6px',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          borderRadius: 'var(--radius-sm)',
                                          transition: 'background 0.2s'
                                        }} 
                                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                                        onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                                        title="Batal pilih"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ) : (
                                    <button type="button" className="btn btn-secondary" style={{ width: '100%', padding: 'var(--sp-2)' }} onClick={() => handleAdd(item)}>
                                      Pilih Item
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
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
                        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Kuantitas: {item.qty}</span>
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
