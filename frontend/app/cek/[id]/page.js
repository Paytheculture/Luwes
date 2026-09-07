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
    setCheckedItems(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        fontFamily: "var(--font-outfit), 'Inter', sans-serif"
      }}>
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          <div style={{
            width: '36px', height: '36px', border: '3px solid #cbd5e1',
            borderTopColor: '#0f172a', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 12px'
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div>Memuat daftar barang...</div>
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
        backgroundColor: '#f8fafc',
        padding: '24px',
        fontFamily: "var(--font-outfit), 'Inter', sans-serif"
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '32px 24px',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
        }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📋</div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 8px' }}>
            Data Tidak Ditemukan
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
            {error || 'Daftar barang dekorasi tidak ada atau sudah dihapus.'}
          </p>
        </div>
      </div>
    );
  }

  const datePasangStr = pesanan.tanggal_pasang ? new Date(pesanan.tanggal_pasang).toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  }) : 'Belum diatur';

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f1f5f9',
      color: '#0f172a',
      fontFamily: "var(--font-outfit), 'Inter', system-ui, sans-serif",
      padding: '16px 12px 40px'
    }}>
      <div style={{
        maxWidth: '560px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0,0,0,0.08)'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: '#09090b',
          color: '#ffffff',
          padding: '28px 20px',
          textAlign: 'center',
          position: 'relative'
        }}>
          <img
            src="/logo-luwes.png"
            alt="Luwes Decoration"
            style={{ height: '42px', width: 'auto', margin: '0 auto 14px', display: 'block', filter: 'brightness(0) invert(1)' }}
          />
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(255,255,255,0.12)',
            color: '#4ade80',
            fontSize: '12px',
            fontWeight: '600',
            padding: '5px 14px',
            borderRadius: '100px',
            marginBottom: '14px'
          }}>
            <span>✓</span> Data Resmi Luwes Decoration
          </div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '700',
            margin: '0 0 8px',
            letterSpacing: '-0.3px',
            fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif"
          }}>
            {pesanan.nama_pengantin}
          </h1>
          <div style={{ fontSize: '13px', color: '#a1a1aa' }}>
            Tanggal Pasang: <strong style={{ color: '#ffffff' }}>{datePasangStr}</strong>
          </div>
        </div>

        {/* Detail Ringkas */}
        <div style={{ padding: '20px', backgroundColor: '#fafafa', borderBottom: '1px solid #e4e4e7' }}>
          <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <span style={{ color: '#71717a', fontSize: '12px' }}>LOKASI ACARA</span>
              <div style={{ fontWeight: '600', color: '#18181b', marginTop: '2px', whiteSpace: 'pre-wrap', fontSize: '14px' }}>
                {pesanan.alamat || '-'}
              </div>
            </div>
            {pesanan.catatan && (
              <div>
                <span style={{ color: '#71717a', fontSize: '12px' }}>CATATAN TIM</span>
                <div style={{ fontWeight: '500', color: '#27272a', marginTop: '2px', whiteSpace: 'pre-wrap' }}>
                  {pesanan.catatan}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* List Ceklis Barang */}
        <div style={{ padding: '20px' }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '700',
            color: '#09090b',
            marginBottom: '14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>CEKLIS BARANG DEKORASI</span>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#16a34a' }}>
              {Object.values(checkedItems).filter(Boolean).length} / {pesanan.items?.length || 0} Tercentang
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(pesanan.items || []).map((item, idx) => {
              const isChecked = !!checkedItems[idx];
              return (
                <div
                  key={idx}
                  onClick={() => toggleCheck(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    backgroundColor: isChecked ? '#f0fdf4' : '#ffffff',
                    border: `1.5px solid ${isChecked ? '#86efac' : '#e4e4e7'}`,
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                    {item.gambar && (
                      <img
                        src={item.gambar}
                        alt={item.nama}
                        style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }}
                      />
                    )}
                    <div style={{ minWidth: 0 }}>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: isChecked ? '#166534' : '#09090b',
                        textDecoration: isChecked ? 'line-through' : 'none'
                      }}>
                        {item.nama}
                      </div>
                      <div style={{ fontSize: '12px', color: isChecked ? '#15803d' : '#71717a', marginTop: '2px' }}>
                        Jumlah: <strong style={{ color: isChecked ? '#166534' : '#09090b' }}>{item.qty} Pcs</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    border: `2px solid ${isChecked ? '#22c55e' : '#cbd5e1'}`,
                    backgroundColor: isChecked ? '#22c55e' : '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    flexShrink: 0,
                    marginLeft: '12px'
                  }}>
                    {isChecked ? '✓' : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info */}
        <div style={{
          padding: '16px 20px',
          backgroundColor: '#fafafa',
          borderTop: '1px solid #e4e4e7',
          textAlign: 'center',
          fontSize: '11px',
          color: '#71717a'
        }}>
          Daftar barang digital resmi <strong>Luwes Decoration Kediri</strong>
        </div>
      </div>
    </div>
  );
}
