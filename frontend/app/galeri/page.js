'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, isLoggedIn } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';

export default function GaleriPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); return; }
    fetchModels();
  }, [router]);

  async function fetchModels() {
    try {
      const res = await api('/api/models');
      // Hanya ambil model yang punya gambar
      const modelsWithImages = (res.data || []).filter(m => m.gambar_url);
      setModels(modelsWithImages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-layout">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="main-content">
        <div className="page-header" style={{ marginBottom: 'var(--sp-6)' }}>
          <div>
            <h2 className="page-title">Galeri Dekorasi</h2>
            <p>Eksplorasi referensi model dekorasi cantik yang sudah tersimpan di katalog.</p>
          </div>
        </div>

        {loading ? (
          <div className="page-loading"><div className="loading-spinner" /></div>
        ) : models.length === 0 ? (
          <div className="table-empty">Belum ada foto model dekorasi yang tersedia di katalog.</div>
        ) : (
          <div className="galeri-masonry">
            {models.map((model) => (
              <div key={model.id} className="galeri-item" onClick={() => setSelectedImage(model)}>
                <img src={model.gambar_url} alt={model.nama} />
                <div className="galeri-item-overlay">
                  <h4>{model.nama}</h4>
                  {model.deskripsi && <p>{model.deskripsi}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Lightbox */}
        {selectedImage && (
          <div className="lightbox-overlay" onClick={() => setSelectedImage(null)}>
            <div className="lightbox-content" onClick={e => e.stopPropagation()}>
              <button className="lightbox-close" onClick={() => setSelectedImage(null)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
              <img src={selectedImage.gambar_url} alt={selectedImage.nama} className="lightbox-img" />
              <div className="lightbox-info">
                <h3>{selectedImage.nama}</h3>
                {selectedImage.deskripsi && <p>{selectedImage.deskripsi}</p>}
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        .galeri-masonry {
          column-count: 3;
          column-gap: 20px;
        }
        @media (max-width: 1024px) {
          .galeri-masonry {
            column-count: 2;
          }
        }
        @media (max-width: 640px) {
          .galeri-masonry {
            column-count: 1;
          }
        }
        
        .galeri-item {
          break-inside: avoid;
          margin-bottom: 20px;
          border-radius: var(--radius-md);
          overflow: hidden;
          position: relative;
          border: 1px solid var(--border-subtle);
          background: var(--bg-surface);
          box-shadow: 0 4px 16px rgba(182, 154, 115, 0.1);
          cursor: pointer;
          transition: all 0.3s var(--ease-out);
        }
        
        .galeri-item:hover {
          transform: translateY(-4px);
          border-color: var(--gold-dim);
          box-shadow: 0 10px 28px rgba(182, 154, 115, 0.2);
        }

        .galeri-item img {
          display: block;
          width: 100%;
          height: auto;
          transition: transform 0.4s var(--ease-out);
        }

        .galeri-item:hover img {
          transform: scale(1.03);
        }

        .galeri-item-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(180deg, rgba(250, 249, 247, 0) 0%, rgba(250, 249, 247, 0.92) 40%, rgba(250, 249, 247, 0.98) 100%);
          backdrop-filter: blur(6px);
          border-top: 1px solid rgba(182, 154, 115, 0.25);
          padding: 20px 18px 16px;
          color: var(--text-primary);
          opacity: 0;
          transform: translateY(8px);
          transition: all 0.3s var(--ease-out);
        }

        .galeri-item:hover .galeri-item-overlay {
          opacity: 1;
          transform: translateY(0);
        }

        .galeri-item-overlay h4 {
          margin: 0 0 4px 0;
          font-family: var(--font-playfair), Georgia, serif;
          font-weight: 600;
          font-size: 1.05rem;
          color: var(--text-primary);
          letter-spacing: -0.01em;
          text-shadow: none;
        }

        .galeri-item-overlay p {
          margin: 0;
          font-size: 0.8125rem;
          color: var(--text-secondary);
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-shadow: none;
        }
        
        /* Lightbox Styles */
        .lightbox-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(35, 31, 28, 0.72);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 24px;
          backdrop-filter: blur(8px);
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .lightbox-content {
          position: relative;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          max-width: 860px;
          width: 100%;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(182, 154, 115, 0.18), 0 8px 24px rgba(44, 42, 41, 0.12);
        }

        .lightbox-close {
          position: absolute;
          top: 16px;
          right: 16px;
          background: rgba(250, 249, 247, 0.9);
          color: var(--text-primary);
          border: 1px solid var(--border);
          border-radius: 50%;
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          box-shadow: 0 2px 8px rgba(182, 154, 115, 0.15);
          transition: all 0.2s var(--ease-out);
        }

        .lightbox-close:hover {
          background: var(--gold);
          color: #ffffff;
          border-color: var(--gold);
          transform: scale(1.05);
        }

        .lightbox-img {
          width: 100%;
          height: auto;
          max-height: calc(90vh - 110px);
          object-fit: contain;
          background: var(--bg-base);
          padding: 12px;
        }

        .lightbox-info {
          padding: 20px 24px;
          background: var(--bg-surface);
          border-top: 1px solid var(--border-subtle);
        }

        .lightbox-info h3 {
          margin: 0 0 6px 0;
          font-family: var(--font-playfair), Georgia, serif;
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .lightbox-info p {
          margin: 0;
          color: var(--text-secondary);
          font-size: 0.875rem;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
}
