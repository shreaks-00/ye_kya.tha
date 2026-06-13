'use client';
import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function SingleMemeClient({ meme }) {
  const [downloading, setDownloading] = useState(false);

  const isVideo = meme.resource_type === 'video';
  const title = meme.context?.custom?.caption || meme.context?.custom?.alt || meme.public_id.split('/').pop();
  const tags = meme.tags || [];
  const format = (meme.format || '').toUpperCase();
  const sizeKB = meme.bytes ? Math.round(meme.bytes / 1024) : null;

  async function handleDownload() {
    setDownloading(true);
    try {
      const res = await fetch(meme.secure_url);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}.${isVideo ? 'mp4' : meme.format || 'jpg'}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(meme.secure_url, '_blank');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.back}>
        <Link href="/memes" className="btn btn-secondary btn-sm" id="back-to-gallery">← Back to Gallery</Link>
      </div>

      <div className={styles.layout}>
        {/* ---- Media ---- */}
        <div className={styles.mediaWrap}>
          {isVideo ? (
            <video
              src={meme.secure_url}
              className={styles.media}
              controls
              autoPlay
              loop
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={meme.secure_url}
              alt={title}
              className={styles.media}
            />
          )}
        </div>

        {/* ---- Info ---- */}
        <div className={styles.info}>
          <div>
            <span className={`badge ${isVideo ? 'badge-pink' : 'badge-purple'}`}>
              {isVideo ? '🎬 VIDEO' : '🖼 IMAGE'}
            </span>
          </div>

          <h1 className={styles.title}>{title}</h1>

          {tags.length > 0 && (
            <div className={styles.tags}>
              {tags.map((t) => <span key={t} className="tag">{t}</span>)}
            </div>
          )}

          <div className={styles.meta}>
            {meme.width && meme.height && (
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Dimensions</span>
                <span className={styles.metaValue}>{meme.width} × {meme.height}</span>
              </div>
            )}
            {format && (
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Format</span>
                <span className={styles.metaValue}>{format}</span>
              </div>
            )}
            {sizeKB && (
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Size</span>
                <span className={styles.metaValue}>{sizeKB > 1024 ? `${(sizeKB/1024).toFixed(1)} MB` : `${sizeKB} KB`}</span>
              </div>
            )}
          </div>

          <button
            className="btn btn-green"
            onClick={handleDownload}
            disabled={downloading}
            id="single-download-btn"
            style={{ width: '100%', justifyContent: 'center', fontSize: '1.1rem', padding: '16px' }}
          >
            {downloading ? (
              <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span> Downloading...</>
            ) : (
              <>⬇ Download {isVideo ? 'Video' : 'Meme'} FREE</>
            )}
          </button>

          <p className={styles.hint}>No sign-up required. Instant download. 🚀</p>
        </div>
      </div>
    </div>
  );
}
