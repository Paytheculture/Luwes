import React, { forwardRef } from 'react';

const PesananExportTemplate = forwardRef(({ pesanan }, ref) => {
  if (!pesanan) return null;

  const heroImage = pesanan.items?.find(item => item.gambar)?.gambar || null;
  const tema = pesanan.catatan || '-';
  
  const dateStr = pesanan.tanggal_pasang ? new Date(pesanan.tanggal_pasang).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) : 'Belum ditentukan';

  const alamat = pesanan.alamat || 'Belum ditentukan';

  // Grouping by Category (Tim)
  const groupedItems = (pesanan.items || []).reduce((acc, item) => {
    const cat = item.id === 'model-dekorasi' || item.id === 'tema-warna' 
      ? 'Spesifikasi Utama' 
      : (item.kategori && item.kategori.trim() !== '' ? item.kategori : 'Lainnya / Belum Ada Tim');
    
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const sortedCategories = Object.keys(groupedItems).sort((a, b) => {
    if (a === 'Spesifikasi Utama') return -1;
    if (b === 'Spesifikasi Utama') return 1;
    if (a.includes('Belum Ada Tim')) return 1;
    if (b.includes('Belum Ada Tim')) return -1;
    return a.localeCompare(b);
  });

  return (
    <div 
      ref={ref}
      style={{
        width: '800px',
        backgroundColor: '#ffffff',
        padding: '50px 60px',
        fontFamily: 'var(--font-outfit), sans-serif',
        color: '#000000',
        position: 'absolute',
        top: '-10000px',
        left: '-10000px',
        zIndex: -1000,
      }}
    >
      {/* Premium Minimalist Letterhead */}
      <div style={{
        textAlign: 'center',
        borderBottom: '2px solid #000',
        paddingBottom: '24px',
        marginBottom: '40px'
      }}>
        <h1 style={{ 
          fontFamily: 'Georgia, serif', 
          fontSize: '48px', 
          fontWeight: 'normal', 
          margin: '0', 
          letterSpacing: '6px',
          color: '#000'
        }}>
          LUWES
        </h1>
        <div style={{ 
          fontSize: '14px', 
          letterSpacing: '8px', 
          textTransform: 'uppercase', 
          marginBottom: '16px',
          color: '#000',
          fontWeight: '500'
        }}>
          Decoration
        </div>
        <div style={{ fontSize: '13px', color: '#444', letterSpacing: '0.5px' }}>
          Kepuhrejo, Kaliboto, Kec. Tarokan, Kabupaten Kediri, Jawa Timur 64152
        </div>
      </div>

      {/* Info Layout */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '40px',
        fontSize: '15px'
      }}>
        <div>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ color: '#666', display: 'inline-block', width: '120px' }}>Klien</span>
            <strong style={{ fontSize: '18px' }}>{pesanan.nama_pengantin}</strong>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ color: '#666', display: 'inline-block', width: '120px' }}>Tanggal</span>
            <strong>{dateStr}</strong>
          </div>
        </div>
        <div>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ color: '#666', display: 'inline-block', width: '100px' }}>Tema</span>
            <strong>{tema}</strong>
          </div>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ color: '#666', display: 'inline-block', width: '100px' }}>Lokasi</span>
            <strong>{alamat}</strong>
          </div>
        </div>
      </div>

      {/* Hero Image */}
      <div style={{
        width: '100%',
        height: '300px',
        backgroundColor: '#f8f8f8',
        marginBottom: '50px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        border: '1px solid #eaeaea'
      }}>
        {heroImage ? (
          <img 
            src={heroImage} 
            alt="Referensi" 
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            crossOrigin="anonymous" 
          />
        ) : (
          <span style={{ color: '#bbb', letterSpacing: '1px' }}>TIDAK ADA GAMBAR REFERENSI</span>
        )}
      </div>

      <div style={{ 
        fontSize: '14px', 
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        marginBottom: '30px',
        paddingBottom: '10px',
        borderBottom: '1px solid #000',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <span>Daftar Item & Kebutuhan Tim</span>
        <span>( Check bila dimuat )</span>
      </div>

      {/* Items per Kategori (Tim) */}
      {pesanan.items && pesanan.items.length > 0 ? (
        sortedCategories.map(kategori => (
          <div key={kategori} style={{ marginBottom: '50px', pageBreakInside: 'avoid' }}>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '800',
              marginBottom: '16px',
              color: '#000',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              {kategori}
            </h3>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '15px'
            }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #000' }}>
                  <th style={{ padding: '12px 0', width: '8%', textAlign: 'left', fontWeight: 'bold' }}>No</th>
                  <th style={{ padding: '12px 0', width: '65%', textAlign: 'left', fontWeight: 'bold' }}>Deskripsi Barang</th>
                  <th style={{ padding: '12px 0', width: '12%', textAlign: 'center', fontWeight: 'bold' }}>Qty</th>
                  <th style={{ padding: '12px 0', width: '15%', textAlign: 'center', fontWeight: 'bold' }}>Check</th>
                </tr>
              </thead>
              <tbody>
                {groupedItems[kategori].map((item, idx) => (
                  <tr key={`${kategori}-${idx}`} style={{ borderBottom: '1px solid #eaeaea' }}>
                    <td style={{ padding: '12px 0', color: '#555' }}>{(idx + 1).toString().padStart(2, '0')}</td>
                    <td style={{ padding: '12px 0', fontWeight: '500' }}>{item.nama}</td>
                    <td style={{ padding: '12px 0', textAlign: 'center', fontWeight: '600' }}>{item.qty}</td>
                    <td style={{ padding: '12px 0', textAlign: 'center' }}>
                      <div style={{ 
                        width: '20px', 
                        height: '20px', 
                        border: '1.5px solid #ccc',
                        margin: '0 auto',
                        borderRadius: '3px'
                      }}></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      ) : (
        <div style={{ textAlign: 'center', color: '#999', padding: '40px 0' }}>
          Kosong.
        </div>
      )}
    </div>
  );
});

PesananExportTemplate.displayName = 'PesananExportTemplate';
export default PesananExportTemplate;
