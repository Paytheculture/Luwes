'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function PublicCekPage() {
  const params = useParams();
  const [pesanan, setPesanan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkedItems, setCheckedItems] = useState({});

  useEffect(() => {
    if (params?.id) {
      loadPesanan();
    }
  }, [params?.id]);

  async function loadPesanan() {
    try {
      const res = await fetch(`/api/pesanan/${params.id}`);
      const data = await res.json();
      if (data.success && data.data) {
        setPesanan(data.data);
      } else {
        setError(data.message || 'Daftar barang tidak ditemukan.');
      }
    } catch (err) {
      setError('Gagal memuat data: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  const toggleCheck = (idx) => {
    setCheckedItems((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        fontFamily: "var(--font-outfit), 'Inter', sans-serif"
      }}>
        <div style={{ textAlign: 'center', color: '#000000', fontSize: '14px', letterSpacing: '2px', textTransform: 'uppercase' }}>
          Memuat Data...
        </div>
      </div>
    );
  }

  if (error || !pesanan) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        padding: '24px',
        fontFamily: "var(--font-outfit), 'Inter', sans-serif"
      }}>
        <div style={{
          border: '1px solid #000000',
          padding: '40px 24px',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center',
        }}>
          <h2 style={{ fontSize: '14px', fontWeight: '400', letterSpacing: '1px', color: '#000000', margin: '0 0 16px', textTransform: 'uppercase' }}>
            Akses Ditolak
          </h2>
          <p style={{ fontSize: '13px', color: '#333333', margin: 0, lineHeight: '1.6' }}>
            {error || 'Dokumen tidak valid atau telah dihapus.'}
          </p>
        </div>
      </div>
    );
  }

  const datePasangStr = pesanan.tanggal_pasang ? new Date(pesanan.tanggal_pasang).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric'
  }) : 'TBA';

  const dateBongkarStr = pesanan.tanggal_bongkar ? new Date(pesanan.tanggal_bongkar).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric'
  }) : 'TBA';

  const totalItems = pesanan.items?.length || 0;
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#FFFFFF',
      color: '#000000',
      fontFamily: "var(--font-outfit), 'Inter', system-ui, sans-serif",
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '640px',
        backgroundColor: '#FFFFFF',
        minHeight: '100vh',
        borderLeft: '1px solid #EAEAEA',
        borderRight: '1px solid #EAEAEA',
        boxSizing: 'border-box'
      }}>
        
        {/* Header / Kop */}
        <div style={{
          padding: '40px 24px 32px',
          borderBottom: '1.5px solid #000000',
          textAlign: 'center'
        }}>
          <div style={{ 
            fontSize: '10px', 
            fontWeight: '600', 
            letterSpacing: '3px', 
            textTransform: 'uppercase', 
            color: '#000000',
            marginBottom: '24px'
          }}>
            Luwes Decoration Kediri
          </div>
          
          <div style={{ 
            fontSize: '11px', 
            color: '#666666', 
            letterSpacing: '1px', 
            textTransform: 'uppercase',
            marginBottom: '8px'
          }}>
            Manifest Pemasangan
          </div>
          
          <h1 style={{
            fontSize: '32px',
            fontWeight: '400',
            margin: '0',
            lineHeight: '1.2',
            color: '#000000',
            fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif"
          }}>
            {pesanan.nama_pengantin}
          </h1>
        </div>

        {/* Meta Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          borderBottom: '1.5px solid #000000',
        }}>
          <div style={{
            padding: '20px 24px',
            borderRight: '1px solid #EAEAEA'
          }}>
            <div style={{ fontSize: '10px', fontWeight: '500', color: '#666666', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>
              Tanggal Pasang
            </div>
            <div style={{ fontSize: '14px', fontWeight: '400', color: '#000000' }}>
              {datePasangStr}
            </div>
          </div>
          <div style={{
            padding: '20px 24px',
          }}>
            <div style={{ fontSize: '10px', fontWeight: '500', color: '#666666', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>
              Tanggal Bongkar
            </div>
            <div style={{ fontSize: '14px', fontWeight: '400', color: '#000000' }}>
              {dateBongkarStr}
            </div>
          </div>
        </div>

        <div style={{
          padding: '24px',
          borderBottom: '1.5px solid #000000',
        }}>
          <div style={{ fontSize: '10px', fontWeight: '500', color: '#666666', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
            Lokasi Acara
          </div>
          <div style={{ fontSize: '15px', fontWeight: '400', color: '#000000', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
            {pesanan.alamat || '-'}
          </div>
          
          {pesanan.catatan && (
            <div style={{ marginTop: '20px' }}>
              <div style={{ fontSize: '10px', fontWeight: '500', color: '#666666', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
                Catatan Operasional
              </div>
              <div style={{ fontSize: '14px', fontWeight: '400', color: '#333333', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                {pesanan.catatan}
              </div>
            </div>
          )}
        </div>

        {/* Checklist Section */}
        <div>
          <div style={{
            padding: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline'
          }}>
            <div style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#000000' }}>
              Daftar Barang
            </div>
            <div style={{ fontSize: '12px', color: '#666666', fontVariantNumeric: 'tabular-nums' }}>
              {checkedCount} / {totalItems} Selesai
            </div>
          </div>

          <div style={{ paddingBottom: '60px' }}>
            {(pesanan.items || []).map((item, idx) => {
              const isChecked = !!checkedItems[idx];
              
              return (
                <div
                  key={idx}
                  onClick={() => toggleCheck(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    padding: '16px 24px',
                    borderTop: '1px solid #EAEAEA',
                    cursor: 'pointer',
                    userSelect: 'none',
                    backgroundColor: isChecked ? '#FAFAFA' : '#FFFFFF',
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  {/* Custom Sharp Checkbox */}
                  <div style={{
                    width: '18px',
                    height: '18px',
                    border: '1px solid #000000',
                    backgroundColor: isChecked ? '#000000' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginRight: '16px',
                    marginTop: '2px',
                    transition: 'all 0.2s ease'
                  }}>
                    {isChecked && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 4.5L3.5 7L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="square"/>
                      </svg>
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0, paddingTop: '1px' }}>
                    <div style={{
                      fontSize: '15px',
                      fontWeight: '400',
                      color: isChecked ? '#888888' : '#000000',
                      textDecoration: isChecked ? 'line-through' : 'none',
                      lineHeight: '1.4',
                      transition: 'color 0.2s ease'
                    }}>
                      {item.nama}
                    </div>
                    {item.qty > 1 && (
                      <div style={{ fontSize: '12px', color: isChecked ? '#AAAAAA' : '#666666', marginTop: '6px', fontVariantNumeric: 'tabular-nums' }}>
                        Qty: {item.qty}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div style={{ borderTop: '1px solid #EAEAEA' }} />
          </div>
        </div>

      </div>
    </div>
  );
}
