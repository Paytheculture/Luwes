import React, { forwardRef } from 'react';

const PesananExportTemplate = forwardRef(({ pesanan, katalogItems }, ref) => {
  if (!pesanan) return null;

  const heroImage = pesanan.items?.find(item => item.gambar)?.gambar || null;

  const datePasangStr = pesanan.tanggal_pasang ? new Date(pesanan.tanggal_pasang).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) : 'Belum ditentukan';

  const dateBongkarStr = pesanan.tanggal_bongkar ? new Date(pesanan.tanggal_bongkar).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) : 'Belum ditentukan';

  const alamat = pesanan.alamat || 'Belum ditentukan';

  // Build katalog lookup map
  const katalogMap = {};
  const katalogByName = {};
  (katalogItems || []).forEach(k => {
    katalogMap[k.id] = k;
    if (k.nama) katalogByName[k.nama.trim().toLowerCase()] = k;
  });

  // Enrich items
  const enrichedItems = (pesanan.items || []).map(item => {
    const namaLower = (item.nama || '').trim().toLowerCase();

    const isSpesifikasi = item.id === 'model-dekorasi' || item.id === 'tema-warna'
      || namaLower.startsWith('model dekorasi:')
      || namaLower.startsWith('tema warna/bunga:');

    if (isSpesifikasi) {
      return { ...item, _resolvedKategori: 'SPESIFIKASI UTAMA' };
    }

    let resolvedKat = (item.kategori && item.kategori.trim() !== '') ? item.kategori : '';
    if (!resolvedKat) {
      const byId = katalogMap[item.id];
      if (byId?.kategori) resolvedKat = byId.kategori;
    }
    if (!resolvedKat) {
      const byName = katalogByName[namaLower];
      if (byName?.kategori) resolvedKat = byName.kategori;
    }

    return { ...item, _resolvedKategori: (resolvedKat || 'TIM PROPERTI').toUpperCase() };
  });

  // Grouping by resolved kategori
  const groupedItems = enrichedItems.reduce((acc, item) => {
    const cat = item._resolvedKategori;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const sortedCategories = Object.keys(groupedItems).sort((a, b) => {
    if (a === 'SPESIFIKASI UTAMA') return -1;
    if (b === 'SPESIFIKASI UTAMA') return 1;
    if (a === 'TIM PROPERTI') return 1;
    if (b === 'TIM PROPERTI') return -1;
    return a.localeCompare(b);
  });

  // Smart Pagination calculation based on exact pixel heights to ensure zero footer clipping
  const page1Capacity = heroImage ? 300 : 480;
  const subsequentCapacity = 660;

  const pagesData = [];
  let currentPageBlocks = [];
  let currentHeight = 0;
  let currentCap = page1Capacity;

  sortedCategories.forEach(cat => {
    const catItems = groupedItems[cat];
    const catHeaderHeight = 55;

    if (currentHeight + catHeaderHeight > currentCap && currentPageBlocks.length > 0) {
      pagesData.push(currentPageBlocks);
      currentPageBlocks = [];
      currentHeight = 0;
      currentCap = subsequentCapacity;
    }

    currentPageBlocks.push({ type: 'cat_header', category: cat });
    currentHeight += catHeaderHeight;

    catItems.forEach((item, idx) => {
      const rowHeight = 38;
      if (currentHeight + rowHeight > currentCap && currentPageBlocks.length > 0) {
        pagesData.push(currentPageBlocks);
        currentPageBlocks = [];
        currentHeight = 0;
        currentCap = subsequentCapacity;
        currentPageBlocks.push({ type: 'cat_header', category: `${cat} (LANJUTAN)` });
        currentHeight += catHeaderHeight;
      }
      currentPageBlocks.push({ type: 'item', data: item, index: idx });
      currentHeight += rowHeight;
    });
  });

  if (currentPageBlocks.length > 0 || pagesData.length === 0) {
    pagesData.push(currentPageBlocks);
  }

  const totalPages = pagesData.length;

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        top: '-99999px',
        left: '-99999px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0px',
        backgroundColor: '#ffffff'
      }}
    >
      {pagesData.map((pageBlocks, pageIdx) => {
        const isFirstPage = pageIdx === 0;
        const isLastPage = pageIdx === totalPages - 1;

        // Group pageBlocks by category for clean table rendering
        const pageCategoryMap = {};
        const pageCategoryOrder = [];
        let currentCatName = '';

        pageBlocks.forEach(block => {
          if (block.type === 'cat_header') {
            currentCatName = block.category;
            if (!pageCategoryMap[currentCatName]) {
              pageCategoryMap[currentCatName] = [];
              pageCategoryOrder.push(currentCatName);
            }
          } else if (block.type === 'item') {
            if (!currentCatName) {
              currentCatName = 'SPESIFIKASI UTAMA';
              if (!pageCategoryMap[currentCatName]) {
                pageCategoryMap[currentCatName] = [];
                pageCategoryOrder.push(currentCatName);
              }
            }
            pageCategoryMap[currentCatName].push(block);
          }
        });

        return (
          <div
            key={pageIdx}
            className="pdf-page"
            style={{
              width: '794px',
              height: '1123px',
              backgroundColor: '#ffffff',
              fontFamily: "var(--font-outfit), 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              color: '#000000',
              boxSizing: 'border-box',
              padding: '40px 48px 48px 48px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* BACKGROUND WATERMARK (5 Rows Diagonal) */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-around',
              alignItems: 'center',
              transform: 'rotate(-25deg) scale(1.15)',
              opacity: 0.035,
              userSelect: 'none'
            }}>
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: '38px',
                    fontWeight: '900',
                    letterSpacing: '6px',
                    color: '#000000',
                    textTransform: 'uppercase',
                    fontFamily: "var(--font-outfit), 'Outfit', sans-serif",
                    whiteSpace: 'nowrap'
                  }}
                >
                  LUWES DECORATION &bull; LUWES DECORATION
                </div>
              ))}
            </div>

            {/* TOP CONTAINER PORTION */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              {/* KOP SURAT (Unified Header on ALL pages) */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                paddingBottom: '16px',
                borderBottom: '1.5px solid #000000',
                marginBottom: isFirstPage ? '24px' : '20px'
              }}>
                <img
                  src="/logo-luwes.png"
                  alt="Luwes Decoration"
                  style={{ height: '48px', width: 'auto', objectFit: 'contain' }}
                  crossOrigin="anonymous"
                />
                <div style={{ textAlign: 'right', fontSize: '12px', color: '#000000', lineHeight: '1.45' }}>
                  <div style={{ fontWeight: '800', letterSpacing: '0.5px', marginBottom: '2px' }}>
                    {isFirstPage ? 'DAFTAR BARANG DEKORASI' : `DAFTAR BARANG (HALAMAN ${pageIdx + 1})`}
                  </div>
                  <div style={{ fontSize: '11px', color: '#222222' }}>
                    Dsn. Kepuhrejo, Kaliboto, Kec. Tarokan<br />
                    Kabupaten Kediri, Jawa Timur 64152
                  </div>
                </div>
              </div>

              {/* FIRST PAGE CLIENT META BLOCK */}
              {isFirstPage && (
                <>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '20px',
                    fontSize: '13px',
                    lineHeight: '1.6'
                  }}>
                    {/* Left Details */}
                    <div style={{ flex: 1, paddingRight: '24px' }}>
                      <h1 style={{
                        fontSize: '24px',
                        fontFamily: "var(--font-playfair), 'Playfair Display', 'Georgia', serif",
                        fontWeight: '600',
                        margin: '0 0 12px 0',
                        color: '#111111',
                        letterSpacing: '-0.3px',
                        lineHeight: '1.2'
                      }}>
                        {pesanan.nama_pengantin || '-'}
                      </h1>

                      <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr', gap: '8px 12px', color: '#444444' }}>
                        <div style={{ color: '#666666' }}>Lokasi:</div>
                        <div style={{ fontWeight: '500', color: '#111111', lineHeight: '1.45', whiteSpace: 'pre-wrap' }}>
                          {alamat}
                        </div>

                        <div style={{ color: '#666666' }}>No. HP:</div>
                        <div style={{ fontWeight: '600', color: '#111111' }}>
                          {pesanan.no_hp || '-'}
                        </div>

                        <div style={{ color: '#666666' }}>Catatan:</div>
                        <div style={{ color: '#333333' }}>
                          {pesanan.catatan || '-'}
                        </div>
                      </div>
                    </div>

                    {/* Right Dates */}
                    <div style={{ textAlign: 'right', minWidth: '220px' }}>
                      <div>
                        <span style={{ color: '#666666', marginRight: '8px' }}>Tanggal Pasang:</span>
                        <span style={{ fontWeight: '600', color: '#111111', fontSize: '13px' }}>{datePasangStr}</span>
                      </div>
                    </div>
                  </div>

                  {/* HERO IMAGE */}
                  {heroImage && (
                    <div style={{ marginBottom: '24px', width: '100%' }}>
                      <img
                        src={heroImage}
                        alt="Referensi Visual Dekorasi"
                        style={{
                          width: '100%',
                          height: '210px',
                          objectFit: 'cover',
                          borderRadius: '0px',
                          display: 'block'
                        }}
                        crossOrigin="anonymous"
                      />
                    </div>
                  )}
                </>
              )}

              {/* CATEGORIES & TABLES ON CURRENT PAGE */}
              {pageCategoryOrder.map(catName => {
                const catRows = pageCategoryMap[catName] || [];
                return (
                  <div key={catName} style={{ marginBottom: '20px' }}>
                    <div style={{
                      fontSize: '13px',
                      fontWeight: '800',
                      letterSpacing: '0.8px',
                      textTransform: 'uppercase',
                      color: '#000000',
                      paddingBottom: '6px',
                      borderBottom: '1.5px solid #000000',
                      marginBottom: '10px'
                    }}>
                      {catName}
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #e0e0e0', color: '#777777', fontSize: '12px' }}>
                          <th style={{ padding: '6px 0', textAlign: 'left', width: '40px', fontWeight: '500' }}>No</th>
                          <th style={{ padding: '6px 0', textAlign: 'left', fontWeight: '500' }}>Deskripsi Barang</th>
                          <th style={{ padding: '6px 0', textAlign: 'right', width: '60px', fontWeight: '500' }}>Qty</th>
                          <th style={{ padding: '6px 0', textAlign: 'right', width: '60px', fontWeight: '500' }}>Check</th>
                        </tr>
                      </thead>
                      <tbody>
                        {catRows.map((rowBlock, rIdx) => {
                          const item = rowBlock.data;
                          return (
                            <tr key={rIdx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                              <td style={{ padding: '8px 0', color: '#888888', fontVariantNumeric: 'tabular-nums' }}>
                                {String(rowBlock.index + 1).padStart(2, '0')}
                              </td>
                              <td style={{ padding: '8px 0', fontWeight: '500', color: '#111111' }}>
                                {item.nama}
                              </td>
                              <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: '600', color: '#111111' }}>
                                {item.qty}
                              </td>
                              <td style={{ padding: '8px 0', textAlign: 'right' }}>
                                <div style={{
                                  width: '18px',
                                  height: '18px',
                                  border: '1.5px solid #000000',
                                  marginLeft: 'auto',
                                  borderRadius: '0px'
                                }} />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>

            {/* FOOTER CONTAINER */}
            <div style={{ position: 'relative', zIndex: 1, paddingTop: '12px' }}>
              <div style={{
                borderTop: '1.5px solid #000000',
                paddingTop: '12px',
                paddingBottom: '4px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end'
              }}>
                {isLastPage ? (
                  <>
                    {/* QR Code Block (Halaman Akhir - Public Link) */}
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`https://luwes-iota.vercel.app/cek/${pesanan.id}`)}&margin=0`}
                        alt="QR Code Cek Digital"
                        style={{ width: '56px', height: '56px' }}
                        crossOrigin="anonymous"
                      />
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#000000', marginBottom: '2px' }}>Scan QR Cek Digital</div>
                        <div style={{ fontSize: '10px', color: '#666666' }}>Scan pakai HP untuk buka daftar barang digital.</div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', fontSize: '11px', color: '#666666', lineHeight: '1.4' }}>
                      <div>Dicetak pada: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                      <div style={{ marginTop: '2px' }}>Daftar Barang Luwes Decoration &bull; Halaman {pageIdx + 1} dari {totalPages}</div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Pembatas Halaman Berlanjut (Non-Halaman Akhir) */}
                    <div style={{ fontSize: '11px', fontWeight: '600', color: '#000000', letterSpacing: '0.5px' }}>
                      LUWES DECORATION &bull; BUKA HALAMAN SEBELAH
                    </div>

                    <div style={{ textAlign: 'right', fontSize: '11px', color: '#666666', lineHeight: '1.4' }}>
                      <div>Dicetak pada: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                      <div style={{ marginTop: '2px' }}>Halaman {pageIdx + 1} dari {totalPages}</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});

PesananExportTemplate.displayName = 'PesananExportTemplate';
export default PesananExportTemplate;






