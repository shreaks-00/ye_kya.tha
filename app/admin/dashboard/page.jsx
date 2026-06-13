'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

const TABS = ['📤 Upload', '📋 Manage', '📊 Stats'];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [stats, setStats] = useState({ total: 0, images: 0, videos: 0 });
  const router = useRouter();

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const [imgRes, vidRes] = await Promise.all([
        fetch('/api/media?type=image&limit=50'),
        fetch('/api/media?type=video&limit=50'),
      ]);
      const imgData = await imgRes.json();
      const vidData = await vidRes.json();
      const all = [...(imgData.resources || []), ...(vidData.resources || [])];
      all.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setItems(all);
      setStats({
        total: all.length,
        images: (imgData.resources || []).length,
        videos: (vidData.resources || []).length,
      });
    } catch {
      showToast('Failed to load media', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  async function handleLogout() {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/admin');
  }

  return (
    <div className={styles.page}>
      {/* ---- Sidebar ---- */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <span>💀</span>
          <span className={styles.sidebarLogoText}>ye_kya.tha</span>
        </div>
        <p className={styles.sidebarRole}>Admin Panel</p>

        <nav className={styles.sidebarNav}>
          {TABS.map((tab, i) => (
            <button
              key={tab}
              className={`${styles.navItem} ${activeTab === i ? styles.navActive : ''}`}
              onClick={() => setActiveTab(i)}
              id={`admin-tab-${i}`}
            >
              {tab}
            </button>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <button className="btn btn-danger btn-sm" onClick={handleLogout} id="logout-btn">
            🚪 Logout
          </button>
          <a href="/" className="btn btn-secondary btn-sm" target="_blank" id="view-site-btn">
            👁 View Site
          </a>
        </div>
      </aside>

      {/* ---- Main ---- */}
      <main className={styles.main}>
        {activeTab === 0 && <UploadTab onSuccess={() => { fetchItems(); showToast('Meme uploaded! 🔥'); setActiveTab(1); }} showToast={showToast} />}
        {activeTab === 1 && <ManageTab items={items} loading={loading} onRefresh={fetchItems} showToast={showToast} />}
        {activeTab === 2 && <StatsTab stats={stats} items={items} />}
      </main>

      {/* ---- Toast ---- */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
        </div>
      )}
    </div>
  );
}

/* =========== UPLOAD TAB =========== */
function UploadTab({ onSuccess, showToast }) {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState('');
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  function pickFile(f) {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return;

    const isVideoFile = file.type.startsWith('video/');
    if (isVideoFile && file.size > 100 * 1024 * 1024) {
      showToast('Video exceeds 100MB limit', 'error');
      return;
    }
    if (!isVideoFile && file.size > 10 * 1024 * 1024) {
      showToast('Image exceeds 10MB limit', 'error');
      return;
    }

    setUploading(true);

    try {
      // 1. Get Signature from our backend
      const contextStr = caption ? `caption=${caption}` : '';
      const tagsStr = tags ? tags.split(',').map(t => t.trim()).filter(Boolean).join(',') : '';

      const signRes = await fetch('/api/sign-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tags: tagsStr || undefined, 
          context: contextStr || undefined 
        })
      });

      if (!signRes.ok) {
        throw new Error('Failed to authorize upload. Check admin session.');
      }

      const { signature, timestamp, cloud_name, api_key, folder } = await signRes.json();

      // 2. Upload file directly to Cloudinary using the signature
      const form = new FormData();
      form.append('file', file);
      form.append('api_key', api_key);
      form.append('timestamp', timestamp);
      form.append('signature', signature);
      form.append('folder', folder);
      if (tagsStr) form.append('tags', tagsStr);
      if (contextStr) form.append('context', contextStr);

      const isVideo = file.type.startsWith('video/');
      const resourceType = isVideo ? 'video' : 'image';

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/${resourceType}/upload`, {
        method: 'POST',
        body: form
      });

      if (!uploadRes.ok) {
        const errData = await uploadRes.json();
        throw new Error(errData.error?.message || 'Cloudinary upload failed');
      }

      // Success
      setFile(null); setCaption(''); setTags(''); setPreview(null);
      onSuccess();
    } catch (err) {
      showToast(err.message || 'Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  }

  const isVideo = file?.type?.startsWith('video/');

  return (
    <div className={styles.tabContent}>
      <h2 className={styles.tabTitle}>📤 Upload New Meme</h2>

      <div className={styles.uploadGrid}>
        {/* Drop Zone */}
        <div
          className={`${styles.dropZone} ${dragOver ? styles.dropOver : ''} ${file ? styles.hasFile : ''}`}
          onClick={() => fileRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); pickFile(e.dataTransfer.files[0]); }}
          id="upload-drop-zone"
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            style={{ display: 'none' }}
            onChange={(e) => pickFile(e.target.files[0])}
            id="upload-file-input"
          />
          {preview ? (
            <div className={styles.previewWrap}>
              {isVideo ? (
                <video src={preview} className={styles.preview} muted />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="preview" className={styles.preview} />
              )}
              <p className={styles.previewName}>{file.name}</p>
            </div>
          ) : (
            <div className={styles.dropPrompt}>
              <span className={styles.dropIcon}>📁</span>
              <p>Drag & drop or click to select</p>
              <span className={styles.dropSub}>Max limits: Videos (100MB) | Images (10MB)</span>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleUpload} className={styles.uploadForm}>
          <div className={styles.field}>
            <label className={styles.label}>Caption / Title</label>
            <input
              className="input"
              type="text"
              placeholder="e.g. When the WiFi dies 💀"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              id="upload-caption"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Tags <span className={styles.labelHint}>(comma separated)</span></label>
            <input
              className="input"
              type="text"
              placeholder="e.g. relatable, dark-humor, trending"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              id="upload-tags"
            />
          </div>

          {file && (
            <div className={styles.fileInfo}>
              <span className={`badge ${isVideo ? 'badge-pink' : 'badge-purple'}`}>
                {isVideo ? '🎬 Video' : '🖼 Image'}
              </span>
              <span className={styles.fileSize}>
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </span>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={!file || uploading}
            id="upload-submit-btn"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {uploading ? (
              <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }}></span> Uploading to Cloudinary...</>
            ) : (
              '🚀 Upload Meme'
            )}
          </button>

          {file && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => { setFile(null); setPreview(null); }}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              ✕ Clear
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

/* =========== MANAGE TAB =========== */
function ManageTab({ items, loading, onRefresh, showToast }) {
  const [editItem, setEditItem] = useState(null);
  const [editCaption, setEditCaption] = useState('');
  const [editTags, setEditTags] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  function openEdit(item) {
    setEditItem(item);
    setEditCaption(item.context?.custom?.caption || '');
    setEditTags((item.tags || []).join(', '));
  }

  async function saveEdit() {
    setSaving(true);
    try {
      const res = await fetch(`/api/media/${encodeURIComponent(editItem.public_id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caption: editCaption,
          tags: editTags.split(',').map((t) => t.trim()).filter(Boolean),
          resource_type: editItem.resource_type,
        }),
      });
      if (res.ok) {
        showToast('Updated! ✨');
        setEditItem(null);
        onRefresh();
      } else {
        showToast('Update failed', 'error');
      }
    } catch {
      showToast('Update failed', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item) {
    if (!confirm(`Delete "${item.context?.custom?.caption || item.public_id}"? This cannot be undone.`)) return;
    setDeleting(item.public_id);
    try {
      const res = await fetch(`/api/media/${encodeURIComponent(item.public_id)}?resource_type=${item.resource_type}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast('Deleted 🗑️');
        onRefresh();
      } else {
        showToast('Delete failed', 'error');
      }
    } catch {
      showToast('Delete failed', 'error');
    } finally {
      setDeleting(null);
    }
  }

  const filtered = items.filter((item) => {
    const matchType = typeFilter === 'all' || item.resource_type === typeFilter;
    const title = item.context?.custom?.caption || item.public_id;
    const matchSearch = !search || title.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className={styles.tabContent}>
      <div className={styles.manageHeader}>
        <h2 className={styles.tabTitle}>📋 Manage Memes</h2>
        <button className="btn btn-secondary btn-sm" onClick={onRefresh} id="refresh-btn">🔄 Refresh</button>
      </div>

      <div className={styles.manageControls}>
        <input
          className="input"
          type="text"
          placeholder="🔍 Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          id="manage-search"
          style={{ flex: 1 }}
        />
        <select className="input" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} id="manage-filter" style={{ width: 140 }}>
          <option value="all">All Types</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
        </select>
      </div>

      {loading ? (
        <div className={styles.loadState}>
          <span className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }}></span>
        </div>
      ) : (
        <>
          <p className={styles.itemCount}>{filtered.length} item{filtered.length !== 1 ? 's' : ''}</p>
          <div className={styles.adminGrid}>
            {filtered.map((item) => {
              const isVideo = item.resource_type === 'video';
              const title = item.context?.custom?.caption || item.public_id.split('/').pop();
              const thumbUrl = isVideo
                ? item.secure_url.replace('/video/upload/', '/video/upload/so_0,f_jpg,w_300/')
                : item.secure_url.replace('/image/upload/', '/image/upload/w_300,q_auto,f_auto/');

              return (
                <div key={item.public_id} className={styles.adminCard}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={thumbUrl} alt={title} className={styles.adminThumb} loading="lazy" />

                  <div className={styles.adminCardInfo}>
                    <p className={styles.adminCardTitle}>{title}</p>
                    <div className={styles.adminCardMeta}>
                      <span className={`badge ${isVideo ? 'badge-pink' : 'badge-purple'}`}>
                        {isVideo ? '🎬' : '🖼'} {item.resource_type}
                      </span>
                      <span className={styles.adminCardDate}>
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {(item.tags || []).length > 0 && (
                      <div className={styles.adminCardTags}>
                        {item.tags.slice(0, 3).map((t) => <span key={t} className="tag" style={{ fontSize: '0.65rem' }}>{t}</span>)}
                      </div>
                    )}
                  </div>

                  <div className={styles.adminCardActions}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => openEdit(item)}
                      id={`edit-${item.public_id.replace(/\//g, '-')}`}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(item)}
                      disabled={deleting === item.public_id}
                      id={`delete-${item.public_id.replace(/\//g, '-')}`}
                    >
                      {deleting === item.public_id ? '...' : '🗑'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ---- Edit Modal ---- */}
      {editItem && (
        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && setEditItem(null)}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>✏️ Edit Title & Tags</h3>
            <div className={styles.field}>
              <label className={styles.label}>Title</label>
              <input className="input" value={editCaption} onChange={(e) => setEditCaption(e.target.value)} id="edit-caption-input" placeholder="Enter title..." />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Tags <span className={styles.labelHint}>(comma separated)</span></label>
              <input className="input" value={editTags} onChange={(e) => setEditTags(e.target.value)} id="edit-tags-input" />
            </div>
            <div className={styles.modalActions}>
              <button className="btn btn-primary" onClick={saveEdit} disabled={saving} id="save-edit-btn" style={{ flex: 1, justifyContent: 'center' }}>
                {saving ? 'Saving...' : '💾 Save'}
              </button>
              <button className="btn btn-secondary" onClick={() => setEditItem(null)} id="cancel-edit-btn" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========== STATS TAB =========== */
function StatsTab({ stats, items }) {
  const recent = items.slice(0, 5);
  return (
    <div className={styles.tabContent}>
      <h2 className={styles.tabTitle}>📊 Stats</h2>

      <div className={styles.statsGrid}>
        {[
          { label: 'Total Memes', value: stats.total, icon: '💀', color: '#bf00ff' },
          { label: 'Images', value: stats.images, icon: '🖼', color: '#00c8ff' },
          { label: 'Videos', value: stats.videos, icon: '🎬', color: '#ff0090' },
        ].map((s) => (
          <div key={s.label} className={styles.statCard} style={{ '--accent': s.color }}>
            <span className={styles.statCardIcon}>{s.icon}</span>
            <span className={styles.statCardValue}>{s.value}</span>
            <span className={styles.statCardLabel}>{s.label}</span>
          </div>
        ))}
      </div>

      <div className={styles.recentSection}>
        <h3 className={styles.recentTitle}>🕐 Recent Uploads</h3>
        <div className={styles.recentList}>
          {recent.map((item) => {
            const title = item.context?.custom?.caption || item.public_id.split('/').pop();
            const isVideo = item.resource_type === 'video';
            return (
              <div key={item.public_id} className={styles.recentItem}>
                <span>{isVideo ? '🎬' : '🖼'}</span>
                <span className={styles.recentTitle2}>{title}</span>
                <span className={styles.recentDate}>{new Date(item.created_at).toLocaleDateString()}</span>
              </div>
            );
          })}
          {recent.length === 0 && <p style={{ color: '#4a4a72' }}>No uploads yet.</p>}
        </div>
      </div>
    </div>
  );
}
