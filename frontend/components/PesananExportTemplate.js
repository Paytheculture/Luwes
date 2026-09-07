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
      className="print-template"
      style={{
        width: '794px',
        minHeight: '1123px',
        backgroundColor: '#ffffff',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        color: '#000000',
        boxSizing: 'border-box',
        padding: '48px',
      }}
    >
      {/* HEADER */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottom: '2px solid #000000',
        paddingBottom: '24px',
        marginBottom: '32px',
      }}>
        <img
          src="/logo_luwes.png"
          alt="Luwes Decoration"
          style={{ height: '56px', width: 'auto', objectFit: 'contain' }}
          crossOrigin="anonymous"
        />
        <div style={{ textAlign: 'right', fontSize: '12px', lineHeight: '1.5' }}>
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>DOKUMEN KERJA</div>
          <div>Dsn. Kepuhrejo, Kaliboto, Kec. Tarokan<br />Kabupaten Kediri, Jawa Timur 64152</div>
        </div>
      </div>

      {/* TITLE & META GRID */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '32px',
        marginBottom: '40px',
      }}>
        {/* Left Col */}
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 16px 0', lineHeight: '1.2' }}>
            {pesanan.nama_pengantin || '—'}
          </h1>
          <div style={{ fontSize: '13px', lineHeight: '1.6', display: 'grid', gridTemplateColumns: '80px 1fr', gap: '4px 8px' }}>
            <span style={{ color: '#555555' }}>Lokasi:</span>
            <span style={{ fontWeight: '500' }}>{pesanan.alamat || '—'}</span>
            
            <span style={{ color: '#555555' }}>No. HP:</span>
            <span style={{ fontWeight: '500' }}>{pesanan.no_hp || '—'}</span>
            
            <span style={{ color: '#555555' }}>Catatan:</span>
            <span style={{ fontWeight: '500' }}>{pesanan.catatan || '—'}</span>
          </div>
        </div>
        {/* Right Col */}
        <div style={{ textAlign: 'right', fontSize: '13px', lineHeight: '1.6' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginBottom: '8px' }}>
            <span style={{ color: '#555555' }}>Tanggal Pasang:</span>
            <span style={{ fontWeight: '600' }}>{dateStr}</span>
          </div>
        </div>
      </div>

      {/* HERO IMAGE */}
      {heroImage && (
        <div style={{ marginBottom: '40px' }}>
          <img
            src={heroImage}
            alt="Referensi Dekorasi"
            style={{ width: '100%', maxHeight: '280px', objectFit: 'contain', border: '1px solid #E5E5E5' }}
            crossOrigin="anonymous"
          />
        </div>
      )}

      {/* CATEGORIES / TABLES */}
      <div style={{ marginBottom: '48px', paddingBottom: '48px' }}>
        {pesanan.items && pesanan.items.length > 0 ? (
          sortedCategories.map((kategori, catIdx) => (
            <div key={kategori} style={{ marginBottom: '32px' }}>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: '700', 
                textTransform: 'uppercase', 
                letterSpacing: '0.5px',
                borderBottom: '1px solid #000000',
                paddingBottom: '8px',
                marginBottom: '12px'
              }}>
                {kategori}
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '8px 8px 8px 0', width: '40px', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #E5E5E5', color: '#555555' }}>No</th>
                    <th style={{ padding: '8px', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #E5E5E5', color: '#555555' }}>Deskripsi Barang</th>
                    <th style={{ padding: '8px', width: '60px', textAlign: 'center', fontWeight: '600', borderBottom: '1px solid #E5E5E5', color: '#555555' }}>Qty</th>
                    <th style={{ padding: '8px 0 8px 8px', width: '60px', textAlign: 'center', fontWeight: '600', borderBottom: '1px solid #E5E5E5', color: '#555555' }}>Check</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedItems[kategori].map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: '10px 8px 10px 0', borderBottom: '1px solid #E5E5E5', color: '#555555' }}>
                        {String(idx + 1).padStart(2, '0')}
                      </td>
                      <td style={{ padding: '10px 8px', borderBottom: '1px solid #E5E5E5', fontWeight: '500', lineHeight: '1.4' }}>
                        {item.nama}
                      </td>
                      <td style={{ padding: '10px 8px', borderBottom: '1px solid #E5E5E5', textAlign: 'center', fontWeight: '600' }}>
                        {item.qty}
                      </td>
                      <td style={{ padding: '10px 0 10px 8px', borderBottom: '1px solid #E5E5E5', textAlign: 'center' }}>
                        <div style={{
                          width: '16px',
                          height: '16px',
                          border: '1px solid #000000',
                          margin: '0 auto',
                        }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', color: '#888888', padding: '40px 0', fontSize: '13px' }}>
            Tidak ada item.
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div style={{
        position: 'absolute',
        bottom: '48px',
        left: '48px',
        right: '48px',
        borderTop: '1px solid #E5E5E5',
        paddingTop: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '11px',
        color: '#888888',
      }}>
        <span>Luwes Decoration — Internal Checklist</span>
        <span>Dicetak: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
      </div>
    </div>
  );
});

PesananExportTemplate.displayName = 'PesananExportTemplate';
export default PesananExportTemplate;

