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
          column-gap: 16px;
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
          margin-bottom: 16px;
          border-radius: var(--radius-lg);
          overflow: hidden;
          position: relative;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          cursor: pointer;
          transition: transform 0.3s ease;
        }
        
        .galeri-item:hover {
          transform: translateY(-4px);
        }

        .galeri-item img {
          display: block;
          width: 100%;
          height: auto;
          border-radius: var(--radius-lg);
        }

        .galeri-item-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
          padding: 24px 16px 16px;
          color: white;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .galeri-item:hover .galeri-item-overlay {
          opacity: 1;
        }

        .galeri-item-overlay h4 {
          margin: 0 0 4px 0;
          font-weight: 600;
          font-size: 16px;
          text-shadow: 0 1px 2px rgba(0,0,0,0.5);
        }

        .galeri-item-overlay p {
          margin: 0;
          font-size: 13px;
          opacity: 0.9;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-shadow: 0 1px 2px rgba(0,0,0,0.5);
        }
        
        /* Lightbox Styles */
        .lightbox-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          backdrop-filter: blur(4px);
        }

        .lightbox-content {
          position: relative;
          background: var(--bg-surface);
          border-radius: var(--radius-lg);
          max-width: 900px;
          width: 100%;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .lightbox-close {
          position: absolute;
          top: 16px;
          right: 16px;
          background: rgba(0, 0, 0, 0.5);
          color: white;
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          transition: background 0.2s ease;
        }

        .lightbox-close:hover {
          background: rgba(0, 0, 0, 0.8);
        }

        .lightbox-img {
          width: 100%;
          height: auto;
          max-height: calc(90vh - 100px);
          object-fit: contain;
          background: #000;
        }

        .lightbox-info {
          padding: 24px;
          background: var(--bg-surface);
        }

        .lightbox-info h3 {
          margin: 0 0 8px 0;
          font-size: 20px;
        }

        .lightbox-info p {
          margin: 0;
          color: var(--text-secondary);
          font-size: 14px;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
}
