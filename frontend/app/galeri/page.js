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
          <Link href="/models/tambah" className="btn btn-primary">
            Tambah Model
          </Link>
        </div>

        {loading ? (
          <div className="page-loading"><div className="loading-spinner" /></div>
        ) : models.length === 0 ? (
          <div className="table-empty">Belum ada foto model dekorasi yang tersedia di katalog.</div>
        ) : (
          <div className="galeri-masonry">
            {models.map((model) => (
              <div key={model.id} className="galeri-item">
                <img src={model.gambar_url} alt={model.nama} />
                <div className="galeri-item-overlay">
                  <h4>{model.nama}</h4>
                  {model.deskripsi && <p>{model.deskripsi}</p>}
                </div>
              </div>
            ))}
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
      `}</style>
    </div>
  );
}
