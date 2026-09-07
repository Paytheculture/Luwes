import React, { forwardRef } from 'react';
import { formatDate } from '@/lib/api';

const PesananExportTemplate = forwardRef(({ pesanan }, ref) => {
  if (!pesanan) return null;

  // Use the first item's image as the hero image if available
  const heroImage = pesanan.items?.find(item => item.gambar)?.gambar || null;

  // Derive Theme from Catatan or fallback
  const tema = pesanan.catatan || '';

  // Format date to match reference: 24 MEI 2026
  const dateStr = pesanan.tanggal_pasang ? new Date(pesanan.tanggal_pasang).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).toUpperCase() : 'TANGGAL BELUM DITENTUKAN';

  const alamat = pesanan.alamat || 'ALAMAT BELUM DITENTUKAN';

  const groupedItems = (pesanan.items || []).reduce((acc, item) => {
    const cat = item.id === 'model-dekorasi' || item.id === 'tema-warna' 
      ? 'Spesifikasi Utama' 
      : (item.kategori || 'Lainnya');
    
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const sortedCategories = Object.keys(groupedItems).sort((a, b) => {
    if (a === 'Spesifikasi Utama') return -1;
    if (b === 'Spesifikasi Utama') return 1;
    if (a === 'Lainnya') return 1;
    if (b === 'Lainnya') return -1;
    return a.localeCompare(b);
  });

  return (
    <div 
      ref={ref}
      style={{
        width: '800px', // Fixed width for consistent export resolution
        backgroundColor: '#ffffff',
        padding: '40px 50px',
        fontFamily: 'var(--font-outfit), sans-serif',
        color: '#000000',
        position: 'absolute',
        top: '-10000px', // Hide from screen
        left: '-10000px',
        zIndex: -1000,
      }}
    >
      {/* Kop Surat (Letterhead) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '4px solid #111',
        paddingBottom: '20px',
        marginBottom: '25px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Logo Placeholder */}
          <div style={{
            width: '70px',
            height: '70px',
            backgroundColor: '#111',
            borderRadius: '12px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#fff',
            fontSize: '32px',
            fontWeight: '900',
            fontFamily: 'serif'
          }}>
            L
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase', color: '#111' }}>
              Luwes Dekorasi
            </h1>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#444', lineHeight: '1.4', maxWidth: '400px' }}>
              Dsn. Kepuhrejo, Kaliboto, Kec. Tarokan<br/>Kabupaten Kediri, Jawa Timur 64152
            </p>
          </div>
        </div>
        <div style={{
          backgroundColor: '#111',
          color: '#fff',
          padding: '12px 24px',
          borderRadius: '8px',
          fontWeight: 'bold',
          fontSize: '20px',
          letterSpacing: '2px',
          textAlign: 'center'
        }}>
          CHECKLIST
        </div>
      </div>

      {/* Hero Image Section */}
      <div style={{
        width: '100%',
        height: '280px',
        backgroundColor: '#f5f5f5',
        marginBottom: '30px',
        borderRadius: '12px',
        border: '8px solid #ebebeb',
        overflow: 'hidden',
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.05)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {heroImage ? (
          <img 
            src={heroImage} 
            alt="Hero Dekorasi" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            crossOrigin="anonymous" 
          />
        ) : (
          <span style={{ color: '#aaa', fontSize: '20px', letterSpacing: '2px' }}>[ GAMBAR MODEL DEKORASI ]</span>
        )}
      </div>

      {/* Info Grid */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        backgroundColor: '#f9f9f9',
        border: '2px solid #eaeaea',
        borderRadius: '12px',
        padding: '20px 25px',
        marginBottom: '30px'
      }}>
        <div style={{ flex: 1, paddingRight: '20px' }}>
          <table style={{ fontSize: '15px', lineHeight: '1.8', width: '100%' }}>
            <tbody>
              <tr>
                <td style={{ width: '130px', color: '#666' }}>Nama Pengantin</td>
                <td style={{ fontWeight: 'bold', color: '#111' }}>: {pesanan.nama_pengantin}</td>
              </tr>
              <tr>
                <td style={{ color: '#666' }}>Tanggal Pasang</td>
                <td style={{ fontWeight: 'bold', color: '#111' }}>: {dateStr}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style={{ flex: 1, paddingLeft: '20px', borderLeft: '2px dashed #ddd' }}>
          <table style={{ fontSize: '15px', lineHeight: '1.8', width: '100%' }}>
            <tbody>
              <tr>
                <td style={{ width: '120px', color: '#666' }}>Tema Dekorasi</td>
                <td style={{ fontWeight: 'bold', color: '#111' }}>: {tema || '-'}</td>
              </tr>
              <tr>
                <td style={{ color: '#666', verticalAlign: 'top' }}>Alamat Lokasi</td>
                <td style={{ fontWeight: 'bold', color: '#111', verticalAlign: 'top' }}>: {alamat}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Note Header */}
      <div style={{ 
        textAlign: 'center', 
        fontSize: '18px', 
        fontWeight: 'bold', 
        marginBottom: '20px',
        color: '#d32f2f',
        backgroundColor: '#ffebee',
        padding: '10px',
        borderRadius: '8px',
        border: '1px solid #ffcdd2'
      }}>
        Catatan : Beri centang (✓) pada kolom checklist bila item sudah dimuat!
      </div>

      {/* Items per Kategori */}
      {pesanan.items && pesanan.items.length > 0 ? (
        sortedCategories.map(kategori => (
          <div key={kategori} style={{ marginBottom: '40px' }}>
            <h3 style={{
              fontSize: '22px',
              fontWeight: 'bold',
              marginBottom: '15px',
              borderBottom: '3px solid #eee',
              paddingBottom: '10px',
              color: '#111',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              {kategori}
            </h3>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '16px'
            }}>
              <thead>
                <tr>
                  <th style={{...tableHeaderStyle, width: '8%'}}>No</th>
                  <th style={{...tableHeaderStyle, width: '60%', textAlign: 'left'}}>Nama Item</th>
                  <th style={{...tableHeaderStyle, width: '12%'}}>Qty</th>
                  <th style={{...tableHeaderStyle, width: '20%'}}>Checklist</th>
                </tr>
              </thead>
              <tbody>
                {groupedItems[kategori].map((item, idx) => (
                  <tr key={`${kategori}-${idx}`}>
                    <td style={{...tableCellStyle, textAlign: 'center'}}>{idx + 1}</td>
                    <td style={{...tableCellStyle, fontWeight: '500'}}>{item.nama}</td>
                    <td style={{...tableCellStyle, textAlign: 'center', fontWeight: 'bold'}}>{item.qty}</td>
                    <td style={tableCellStyle}></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      ) : (
        <div style={{ textAlign: 'center', color: '#999', padding: '40px', border: '2px dashed #ccc', borderRadius: '8px' }}>
          Tidak ada item terdaftar untuk pesanan ini.
        </div>
      )}
    </div>
  );
});

const tableHeaderStyle = {
  border: '2px solid #222',
  padding: '12px 15px',
  fontWeight: 'bold',
  textAlign: 'center',
  backgroundColor: '#f0f0f0',
  color: '#111',
  textTransform: 'uppercase',
  fontSize: '14px',
  letterSpacing: '0.5px'
};

const tableCellStyle = {
  border: '1px solid #444',
  padding: '12px 15px',
};

PesananExportTemplate.displayName = 'PesananExportTemplate';
export default PesananExportTemplate;
