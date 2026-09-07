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
        padding: '40px',
      }}
    >
      {/* ===== HEADER ===== */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottom: '2px solid #000000',
        paddingBottom: '24px',
        marginBottom: '32px'
      }}>
        <img
          src="/logo-luwes.png"
          alt="Luwes Dekorasi"
          style={{ height: '70px', width: 'auto', objectFit: 'contain' }}
          crossOrigin="anonymous"
        />
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '-0.5px' }}>
            MANIFEST OPERASIONAL
          </div>
          <div style={{ fontSize: '14px', color: '#555555', marginTop: '4px' }}>
            ID: {pesanan.id || 'N/A'}
          </div>
        </div>
      </div>

      {/* ===== INFO GRID ===== */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
        marginBottom: '40px',
        fontSize: '14px',
        lineHeight: '1.5'
      }}>
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Klien</div>
          <div style={{ fontSize: '18px', marginBottom: '16px' }}>{pesanan.nama_pengantin || '-'}</div>
          
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Lokasi Pemasangan</div>
          <div style={{ wordBreak: 'break-word' }}>{pesanan.alamat || '-'}</div>
        </div>
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Jadwal Pemasangan</div>
          <div style={{ marginBottom: '16px' }}>{dateStr}</div>

          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Catatan / Tema</div>
          <div style={{ wordBreak: 'break-word' }}>{pesanan.catatan || '-'}</div>
        </div>
      </div>

      {/* ===== HERO IMAGE ===== */}
      {heroImage && (
        <div style={{ marginBottom: '40px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '12px', borderBottom: '1px solid #000000', paddingBottom: '8px' }}>
            Referensi Visual
          </div>
          <img
            src={heroImage}
            alt="Referensi"
            style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', border: '1px solid #e0e0e0', padding: '4px' }}
            crossOrigin="anonymous"
          />
        </div>
      )}

      {/* ===== TABLES ===== */}
      <div style={{ marginBottom: '16px', fontWeight: 'bold', fontSize: '16px' }}>
        Daftar Kebutuhan Tim
      </div>

      {pesanan.items && pesanan.items.length > 0 ? (
        sortedCategories.map((kategori, catIdx) => (
          <div key={kategori} style={{ marginBottom: '32px', pageBreakInside: 'avoid' }}>
            <div style={{
              backgroundColor: '#000000',
              color: '#ffffff',
              padding: '8px 12px',
              fontSize: '14px',
              fontWeight: 'bold',
            }}>
              {kategori}
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #000000' }}>
                  <th style={{ padding: '12px', width: '40px', textAlign: 'left', fontWeight: 'bold' }}>No</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Deskripsi Barang</th>
                  <th style={{ padding: '12px', width: '60px', textAlign: 'center', fontWeight: 'bold' }}>Qty</th>
                  <th style={{ padding: '12px', width: '80px', textAlign: 'center', fontWeight: 'bold' }}>Check</th>
                </tr>
              </thead>
              <tbody>
                {groupedItems[kategori].map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e0e0e0' }}>
                    <td style={{ padding: '12px', color: '#555555', fontVariantNumeric: 'tabular-nums' }}>
                      {String(idx + 1).padStart(2, '0')}
                    </td>
                    <td style={{ padding: '12px', wordBreak: 'break-word', lineHeight: '1.4' }}>
                      {item.nama}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                      {item.qty}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <div style={{
                        width: '20px',
                        height: '20px',
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
        <div style={{ textAlign: 'center', color: '#888888', padding: '40px' }}>
          Tidak ada item terdaftar.
        </div>
      )}

      {/* ===== FOOTER ===== */}
      <div style={{
        marginTop: '40px',
        paddingTop: '16px',
        borderTop: '1px solid #000000',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '12px',
        color: '#555555'
      }}>
        <span>Dicetak pada: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
        <span>Dokumen Internal Luwes Dekorasi</span>
      </div>
    </div>
  );
});

PesananExportTemplate.displayName = 'PesananExportTemplate';
export default PesananExportTemplate;


