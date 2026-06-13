'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import styles from './MemeCard.module.css';

export default function MemeCard({ item }) {
  const [downloading, setDownloading] = useState(false);
  const [hovering, setHovering] = useState(false);
  const videoRef = useRef(null);

  const isVideo = item.resource_type === 'video';
  const thumbUrl = isVideo
    ? item.secure_url.replace('/video/upload/', '/video/upload/so_0,f_jpg,w_600/')
    : item.secure_url.replace('/image/upload/', '/image/upload/w_600,q_auto,f_auto/');

  const title = item.context?.custom?.caption || item.context?.custom?.alt || item.public_id.split('/').pop();
  const tags = item.tags || [];

  useEffect(() => {
    if (!videoRef.current) return;
    if (hovering) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [hovering]);

  async function handleDownload(e) {
    e.preventDefault();
    setDownloading(true);
    try {
      const res = await fetch(item.secure_url);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}.${isVideo ? 'mp4' : item.format || 'jpg'}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(item.secure_url, '_blank');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div
      className={styles.card}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <Link href={`/memes/${item.public_id}`} className={styles.mediaWrap}>
        {isVideo ? (
          <>
            {/* Show static thumbnail by default, reveal playing video on hover */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={thumbUrl} alt={title} className={`${styles.media} ${hovering ? styles.hidden : ''}`} loading="lazy" />
            <video
              ref={videoRef}
              src={hovering ? item.secure_url : ''} 
              className={`${styles.media} ${!hovering ? styles.hidden : ''}`}
              muted
              loop
              playsInline
              preload="none"
            />
          </>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbUrl} alt={title} className={styles.media} loading="lazy" />
        )}

        <div className={`${styles.overlay} ${hovering ? styles.overlayVisible : ''}`}>
          <span className={styles.viewBtn}>👁 View</span>
        </div>

        {isVideo && (
          <span className={styles.videoBadge}>▶ VIDEO</span>
        )}
      </Link>

      <div className={styles.info}>
        <p className={styles.title}>{title}</p>

        {tags.length > 0 && (
          <div className={styles.tags}>
            {tags.slice(0, 3).map((t) => (
              <span key={t} className="tag">{t}</span>
            ))}
          </div>
        )}

        <button
          className={`btn btn-green btn-sm ${styles.dlBtn}`}
          onClick={handleDownload}
          disabled={downloading}
          id={`download-${item.public_id.replace(/\//g, '-')}`}
        >
          {downloading ? (
            <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }}></span> Downloading...</>
          ) : (
            <>⬇ Download</>
          )}
        </button>
      </div>
    </div>
  );
}
