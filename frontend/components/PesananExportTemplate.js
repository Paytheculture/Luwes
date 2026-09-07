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
        backgroundColor: '#ffffff',
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        color: '#000000',
        position: 'absolute',
        top: '-99999px',
        left: '-99999px',
        boxSizing: 'border-box',
        padding: '48px',
      }}
    >
      {/* ===== HEADER ===== */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '40px'
      }}>
        <img
          src="/logo-luwes.png"
          alt="Luwes Dekorasi"
          style={{ height: '56px', width: 'auto', objectFit: 'contain' }}
          crossOrigin="anonymous"
        />
        <div style={{ textAlign: 'right', fontSize: '11px', lineHeight: '1.4', color: '#555555', maxWidth: '200px' }}>
          Kepuhrejo, Kaliboto, Kec. Tarokan,<br/>Kabupaten Kediri, Jawa Timur 64152
        </div>
      </div>

      {/* ===== TITLE & META ===== */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', color: '#888888' }}>
          Manifest Operasional &bull; {pesanan.id || 'N/A'}
        </div>
        <div style={{ fontSize: '36px', fontWeight: 'bold', letterSpacing: '-1px', lineHeight: '1.1', marginBottom: '24px' }}>
          {pesanan.nama_pengantin || '-'}
        </div>
        
        <div style={{ display: 'flex', gap: '48px', borderTop: '2px solid #000000', borderBottom: '1px solid #e0e0e0', padding: '16px 0' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', color: '#888888', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Jadwal Pemasangan</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{dateStr}</div>
          </div>
          <div style={{ flex: 2 }}>
            <div style={{ fontSize: '11px', color: '#888888', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Lokasi Pemasangan</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{pesanan.alamat || '-'}</div>
          </div>
        </div>
      </div>

      {/* ===== CATATAN & IMAGE ===== */}
      <div style={{ display: 'flex', gap: '32px', marginBottom: '48px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '11px', color: '#888888', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Catatan / Tema</div>
          <div style={{ fontSize: '14px', lineHeight: '1.5' }}>{pesanan.catatan || 'Tidak ada catatan.'}</div>
        </div>
        {heroImage && (
          <div style={{ width: '300px' }}>
             <div style={{ fontSize: '11px', color: '#888888', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Referensi Visual</div>
             <img
                src={heroImage}
                alt="Referensi"
                style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', border: '1px solid #e0e0e0' }}
                crossOrigin="anonymous"
              />
          </div>
        )}
      </div>

      {/* ===== TABLES ===== */}
      <div style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 'bold', letterSpacing: '-0.5px' }}>
        Daftar Kebutuhan Tim
      </div>

      {pesanan.items && pesanan.items.length > 0 ? (
        sortedCategories.map((kategori, catIdx) => (
          <div key={kategori} style={{ marginBottom: '32px', pageBreakInside: 'avoid' }}>
            <div style={{
              backgroundColor: '#000000',
              color: '#ffffff',
              padding: '8px 12px',
              fontSize: '13px',
              fontWeight: 'bold',
              letterSpacing: '0.5px',
              textTransform: 'uppercase'
            }}>
              {kategori}
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <tbody>
                {groupedItems[kategori].map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e0e0e0' }}>
                    <td style={{ padding: '12px', width: '40px', color: '#888888', fontVariantNumeric: 'tabular-nums' }}>
                      {String(idx + 1).padStart(2, '0')}
                    </td>
                    <td style={{ padding: '12px', lineHeight: '1.4' }}>
                      {item.nama}
                    </td>
                    <td style={{ padding: '12px', width: '60px', textAlign: 'center', fontWeight: 'bold' }}>
                      {item.qty}
                    </td>
                    <td style={{ padding: '12px', width: '60px', textAlign: 'center' }}>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '1.5px solid #000000',
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
        <div style={{ textAlign: 'center', color: '#888888', padding: '40px', border: '1px dashed #e0e0e0' }}>
          Tidak ada item terdaftar.
        </div>
      )}

      {/* ===== FOOTER & QR CODE ===== */}
      <div style={{
        marginTop: '64px',
        paddingTop: '24px',
        borderTop: '2px solid #000000',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end'
      }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&margin=0`}
            alt="QR Code"
            style={{ width: '64px', height: '64px' }}
            crossOrigin="anonymous"
          />
          <div>
            <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '2px' }}>Pindai untuk akses digital</div>
            <div style={{ fontSize: '11px', color: '#555555' }}>Gunakan kamera HP untuk membuka dokumen ini.</div>
          </div>
        </div>
        <div style={{ textAlign: 'right', fontSize: '11px', color: '#555555' }}>
          <div>Dicetak pada: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
          <div style={{ marginTop: '2px' }}>Dokumen Internal Luwes Dekorasi</div>
        </div>
      </div>
    </div>
  );
});

PesananExportTemplate.displayName = 'PesananExportTemplate';
export default PesananExportTemplate;


