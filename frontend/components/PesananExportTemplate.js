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
      {/* Hero Image Section */}
      <div style={{
        width: '100%',
        height: '350px',
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
            crossOrigin="anonymous" // Important for html2canvas
          />
        ) : (
          <span style={{ color: '#aaa', fontSize: '20px', letterSpacing: '2px' }}>[ LUWES DECORATION ]</span>
        )}
      </div>

      {/* Date & Location */}
      <div style={{ fontSize: '18px', fontWeight: '500', marginBottom: '20px' }}>
        {dateStr} ( {alamat} )
      </div>

      {/* Details List */}
      <ul style={{ 
        listStyleType: 'disc', 
        paddingLeft: '30px', 
        fontSize: '16px', 
        marginBottom: '30px',
        lineHeight: '1.6' 
      }}>
        <li><strong>Tema :</strong> {tema}</li>
        <li><strong>Nama :</strong> {pesanan.nama_pengantin}</li>
      </ul>

      {/* Note Header */}
      <div style={{ 
        textAlign: 'center', 
        fontSize: '18px', 
        fontWeight: 'bold', 
        marginBottom: '15px' 
      }}>
        Catatan : Centang (V) Bila Sudah !
      </div>

      {/* Items Table */}
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '16px'
      }}>
        <thead>
          <tr>
            <th style={tableHeaderStyle}>No</th>
            <th style={tableHeaderStyle}>Item</th>
            <th style={tableHeaderStyle}>Jumlah</th>
            <th style={tableHeaderStyle}>Checklist</th>
          </tr>
        </thead>
        <tbody>
          {pesanan.items && pesanan.items.length > 0 ? (
            pesanan.items.map((item, idx) => (
              <tr key={idx}>
                <td style={{...tableCellStyle, textAlign: 'center'}}>{idx + 1}</td>
                <td style={tableCellStyle}>{item.nama}</td>
                <td style={{...tableCellStyle, textAlign: 'center'}}>{item.qty}</td>
                <td style={tableCellStyle}></td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{...tableCellStyle, textAlign: 'center', color: '#999'}}>
                Tidak ada item terdaftar
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
});

const tableHeaderStyle = {
  border: '1px solid #000',
  padding: '10px 15px',
  fontWeight: 'bold',
  textAlign: 'center',
  backgroundColor: '#f9f9f9'
};

const tableCellStyle = {
  border: '1px solid #000',
  padding: '12px 15px',
};

PesananExportTemplate.displayName = 'PesananExportTemplate';
export default PesananExportTemplate;
