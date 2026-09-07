import React, { forwardRef } from 'react';

const PesananExportTemplate = forwardRef(({ pesanan, katalogItems }, ref) => {
  if (!pesanan) return null;

  const heroImage = pesanan.items?.find(item => item.gambar)?.gambar || null;
  const tema = pesanan.catatan || '-';
  
  const dateStr = pesanan.tanggal_pasang ? new Date(pesanan.tanggal_pasang).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) : 'Belum ditentukan';

  const alamat = pesanan.alamat || 'Belum ditentukan';

  // Build katalog lookup map from prop
  const katalogMap = {};
  const katalogByName = {};
  (katalogItems || []).forEach(k => {
    katalogMap[k.id] = k;
    if (k.nama) katalogByName[k.nama.trim().toLowerCase()] = k;
  });

  // Enrich items: detect by ID, name prefix, atau lookup by nama di katalog
  const enrichedItems = (pesanan.items || []).map(item => {
    const namaLower = (item.nama || '').trim().toLowerCase();
    
    // Deteksi model dekorasi dan tema warna via ID atau awalan nama
    const isSpesifikasi = item.id === 'model-dekorasi' || item.id === 'tema-warna'
      || namaLower.startsWith('model dekorasi:')
      || namaLower.startsWith('tema warna/bunga:');

    if (isSpesifikasi) {
      return { ...item, _resolvedKategori: 'Spesifikasi Utama' };
    }

    // Cari kategori: dari item.kategori, lalu katalog by ID, lalu katalog by nama
    let resolvedKat = (item.kategori && item.kategori.trim() !== '') ? item.kategori : '';
    if (!resolvedKat) {
      const byId = katalogMap[item.id];
      if (byId?.kategori) resolvedKat = byId.kategori;
    }
    if (!resolvedKat) {
      const byName = katalogByName[namaLower];
      if (byName?.kategori) resolvedKat = byName.kategori;
    }

    return { ...item, _resolvedKategori: resolvedKat || 'Belum Ada Tim' };
  });

  // Grouping by resolved kategori
  const groupedItems = enrichedItems.reduce((acc, item) => {
    const cat = item._resolvedKategori;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const sortedCategories = Object.keys(groupedItems).sort((a, b) => {
    if (a === 'Spesifikasi Utama') return -1;
    if (b === 'Spesifikasi Utama') return 1;
    if (a === 'Belum Ada Tim') return 1;
    if (b === 'Belum Ada Tim') return -1;
    return a.localeCompare(b);
  });

  return (
    <div
      ref={ref}
      style={{
        width: '794px',
        minHeight: '1123px',
        backgroundColor: '#ffffff',
        fontFamily: "'Georgia', 'Times New Roman', serif",
        color: '#1a1a1a',
        position: 'absolute',
        top: '-99999px',
        left: '-99999px',
        boxSizing: 'border-box',
      }}
    >
      {/* ===== KOP SURAT ===== */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '32px 48px 24px',
        borderBottom: '3px solid #c9a84c',
        backgroundColor: '#fff',
      }}>
        {/* Logo */}
        <img
          src="/logo.png"
          alt="Luwes Decoration"
          style={{ height: '64px', width: 'auto', objectFit: 'contain' }}
          crossOrigin="anonymous"
        />

        {/* Info perusahaan - rata kanan */}
        <div style={{ textAlign: 'right', fontFamily: "'Arial', sans-serif" }}>
          <div style={{ fontSize: '11px', color: '#888', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '4px' }}>
            Dokumen Kerja
          </div>
          <div style={{ fontSize: '11px', color: '#555', lineHeight: '1.6' }}>
            Dsn. Kepuhrejo, Kaliboto<br />
            Kec. Tarokan, Kabupaten Kediri<br />
            Jawa Timur 64152
          </div>
        </div>
      </div>

      {/* ===== JUDUL DOKUMEN ===== */}
      <div style={{
        padding: '20px 48px 16px',
        borderBottom: '1px solid #e8e0d0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        backgroundColor: '#fafaf8',
      }}>
        <div>
          <div style={{ fontSize: '9px', fontFamily: "'Arial', sans-serif", color: '#999', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '4px' }}>
            Checklist Pemasangan Dekorasi
          </div>
          <div style={{ fontSize: '22px', fontWeight: 'bold', fontFamily: "'Georgia', serif", color: '#1a1a1a', letterSpacing: '0.3px' }}>
            {pesanan.nama_pengantin || '—'}
          </div>
        </div>
        <div style={{ textAlign: 'right', fontFamily: "'Arial', sans-serif", fontSize: '12px', color: '#555' }}>
          <div style={{ marginBottom: '2px' }}>
            <span style={{ color: '#999', marginRight: '8px' }}>Tanggal Pasang</span>
            <strong style={{ color: '#1a1a1a' }}>{dateStr}</strong>
          </div>
          <div style={{ marginBottom: '2px' }}>
            <span style={{ color: '#999', marginRight: '8px' }}>Status</span>
            <strong style={{ color: '#1a1a1a' }}>{pesanan.status || 'Pending'}</strong>
          </div>
        </div>
      </div>

      {/* ===== INFO PESANAN ===== */}
      <div style={{
        padding: '14px 48px',
        backgroundColor: '#fafaf8',
        borderBottom: '1px solid #e8e0d0',
        display: 'flex',
        gap: '32px',
        fontFamily: "'Arial', sans-serif",
        fontSize: '12px',
      }}>
        <div style={{ flex: 1 }}>
          <span style={{ color: '#999', display: 'block', fontSize: '10px', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '2px' }}>Lokasi Pemasangan</span>
          <span style={{ color: '#1a1a1a', fontWeight: '600', wordBreak: 'break-word', lineHeight: '1.5' }}>{pesanan.alamat || '—'}</span>
        </div>
        {pesanan.catatan && (
          <div style={{ flex: 1 }}>
            <span style={{ color: '#999', display: 'block', fontSize: '10px', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '2px' }}>Catatan</span>
            <span style={{ color: '#1a1a1a', fontWeight: '600', wordBreak: 'break-word', lineHeight: '1.5' }}>{pesanan.catatan}</span>
          </div>
        )}
        {pesanan.no_hp && (
          <div>
            <span style={{ color: '#999', display: 'block', fontSize: '10px', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '2px' }}>No. HP</span>
            <span style={{ color: '#1a1a1a', fontWeight: '600' }}>{pesanan.no_hp}</span>
          </div>
        )}
      </div>

      {/* ===== GAMBAR REFERENSI ===== */}
      {heroImage && (
        <div style={{ padding: '20px 48px 0' }}>
          <div style={{ fontSize: '9px', fontFamily: "'Arial', sans-serif", color: '#bbb', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '8px' }}>
            Gambar Referensi
          </div>
          <img
            src={heroImage}
            alt="Referensi Dekorasi"
            style={{ width: '100%', maxHeight: '240px', objectFit: 'contain', display: 'block', border: '1px solid #f0ece4' }}
            crossOrigin="anonymous"
          />
        </div>
      )}

      {/* ===== TABEL ITEM PER TIM ===== */}
      <div style={{ padding: '24px 48px 40px' }}>
        {pesanan.items && pesanan.items.length > 0 ? (
          sortedCategories.map((kategori, catIdx) => (
            <div key={kategori} style={{ marginBottom: catIdx < sortedCategories.length - 1 ? '28px' : '0' }}>
              {/* Header Tim */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '0',
              }}>
                <div style={{
                  backgroundColor: kategori === 'Spesifikasi Utama' ? '#f5f0e8' : '#1a1a1a',
                  color: kategori === 'Spesifikasi Utama' ? '#8a6d2c' : '#ffffff',
                  padding: '6px 16px',
                  fontSize: '11px',
                  fontFamily: "'Arial', sans-serif",
                  fontWeight: 'bold',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                }}>
                  {kategori}
                </div>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#e0d9cc', marginLeft: '0' }} />
              </div>

              {/* Tabel */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Arial', sans-serif" }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid #1a1a1a' }}>
                    <th style={{ padding: '8px 6px 8px 0', width: '36px', textAlign: 'left', fontSize: '10px', fontWeight: '700', color: '#555', letterSpacing: '0.5px' }}>No</th>
                    <th style={{ padding: '8px 6px', textAlign: 'left', fontSize: '10px', fontWeight: '700', color: '#555', letterSpacing: '0.5px' }}>Nama Barang</th>
                    <th style={{ padding: '8px 6px', width: '48px', textAlign: 'center', fontSize: '10px', fontWeight: '700', color: '#555', letterSpacing: '0.5px' }}>Qty</th>
                    <th style={{ padding: '8px 0 8px 6px', width: '56px', textAlign: 'center', fontSize: '10px', fontWeight: '700', color: '#555', letterSpacing: '0.5px' }}>✓</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedItems[kategori].map((item, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: '1px solid #f0ece4',
                        backgroundColor: idx % 2 === 0 ? '#fff' : '#fafaf8',
                      }}
                    >
                      <td style={{ padding: '9px 6px 9px 0', fontSize: '11px', color: '#aaa', fontVariantNumeric: 'tabular-nums' }}>
                        {String(idx + 1).padStart(2, '0')}
                      </td>
                      <td style={{ padding: '9px 6px', fontSize: '13px', color: '#1a1a1a', lineHeight: '1.4', wordBreak: 'break-word' }}>
                        {item.nama}
                      </td>
                      <td style={{ padding: '9px 6px', textAlign: 'center', fontSize: '13px', fontWeight: '700', color: '#1a1a1a' }}>
                        {item.qty}
                      </td>
                      <td style={{ padding: '9px 0 9px 6px', textAlign: 'center' }}>
                        <div style={{
                          width: '18px',
                          height: '18px',
                          border: '1.5px solid #c9a84c',
                          margin: '0 auto',
                          borderRadius: '2px',
                        }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', color: '#bbb', padding: '40px 0', fontSize: '13px', fontFamily: "'Arial', sans-serif" }}>
            Tidak ada item.
          </div>
        )}
      </div>

      {/* ===== FOOTER ===== */}
      <div style={{
        padding: '16px 48px',
        borderTop: '1px solid #e8e0d0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontFamily: "'Arial', sans-serif",
        fontSize: '10px',
        color: '#bbb',
      }}>
        <span>Luwes Decoration &mdash; Dokumen Internal</span>
        <span>Dicetak: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
      </div>
    </div>
  );
});

PesananExportTemplate.displayName = 'PesananExportTemplate';
export default PesananExportTemplate;

