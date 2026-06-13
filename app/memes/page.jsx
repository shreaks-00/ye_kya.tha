'use client';
import { useState, useEffect, useCallback } from 'react';
import MemeCard from '../components/MemeCard';
import styles from './page.module.css';

const SORT_OPTIONS = [
  { value: 'created_at', label: '🆕 Newest' },
  { value: 'public_id', label: '🔤 Name' },
];

const TYPE_FILTERS = [
  { value: 'all', label: '🎭 All' },
  { value: 'image', label: '🖼 Images' },
  { value: 'video', label: '🎬 Videos' },
];

export default function MemesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [typeFilter, setTypeFilter] = useState('all');
  const [nextCursor, setNextCursor] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchMemes = useCallback(async (cursor = null, reset = true) => {
    if (reset) setLoading(true);
    else setLoadingMore(true);

    try {
      const params = new URLSearchParams({ sort: sortBy, type: typeFilter });
      if (cursor) params.set('cursor', cursor);
      const res = await fetch(`/api/media?${params}`);
      const data = await res.json();

      if (reset) {
        setItems(data.resources || []);
      } else {
        setItems((prev) => [...prev, ...(data.resources || [])]);
      }
      setNextCursor(data.next_cursor || null);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [sortBy, typeFilter]);

  useEffect(() => {
    fetchMemes(null, true);
  }, [fetchMemes]);

  const filtered = items.filter((item) => {
    if (!search.trim()) return true;
    const title = item.context?.custom?.caption || item.context?.custom?.alt || item.public_id;
    const tags = (item.tags || []).join(' ');
    return (title + ' ' + tags).toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className={styles.page}>
      {/* ---- Header ---- */}
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>
          <span className="gradient-text">ye_kya.tha</span> 💀
        </h1>
        <p className={styles.pageSub}>Browse all memes & clips. Click to view, then download for free.</p>
      </div>

      {/* ---- Controls ---- */}
      <div className={styles.controls}>
        <input
          className={`input ${styles.searchInput}`}
          type="text"
          placeholder="🔍 Search memes, tags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          id="meme-search"
        />

        <div className={styles.typeFilters}>
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.value}
              className={`tag ${typeFilter === f.value ? 'active' : ''}`}
              onClick={() => setTypeFilter(f.value)}
              id={`filter-${f.value}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <select
          className={`input ${styles.sortSelect}`}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          id="meme-sort"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* ---- Grid ---- */}
      {loading ? (
        <div className={styles.loadingState}>
          <span className="spinner" style={{ width: 48, height: 48, borderWidth: 4 }}></span>
          <p>Loading the vault...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <span>🐸</span>
          <p>{search ? 'No memes match your search.' : 'The vault is empty. Check back soon!'}</p>
        </div>
      ) : (
        <>
          <div className={styles.count}>{filtered.length} item{filtered.length !== 1 ? 's' : ''}</div>
          <div className="meme-grid">
            {filtered.map((item) => (
              <MemeCard key={item.public_id} item={item} />
            ))}
          </div>

          {nextCursor && !search && (
            <div className={styles.loadMore}>
              <button
                className="btn btn-secondary"
                onClick={() => fetchMemes(nextCursor, false)}
                disabled={loadingMore}
                id="load-more-btn"
              >
                {loadingMore ? (
                  <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }}></span> Loading...</>
                ) : (
                  'Load More 🎭'
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
