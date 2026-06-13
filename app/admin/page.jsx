'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push('/admin/dashboard');
      } else {
        setError('Wrong password. Try again. 🔒');
      }
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.bgOrbs}>
        <div className={styles.orb1}></div>
        <div className={styles.orb2}></div>
      </div>

      <div className={styles.card}>
        <div className={styles.icon}>🔐</div>
        <h1 className={styles.title}>Admin Access</h1>
        <p className={styles.sub}>Enter your password to manage ye_kya.tha.</p>

        <form onSubmit={handleLogin} className={styles.form}>
          <input
            className="input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            id="admin-password-input"
            autoComplete="current-password"
          />

          {error && <p className={styles.error}>{error}</p>}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !password}
            id="admin-login-btn"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {loading ? (
              <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }}></span> Logging in...</>
            ) : (
              'Enter the Vault 💀'
            )}
          </button>
        </form>

        <p className={styles.hint}>This page is for the site owner only.</p>
      </div>
    </div>
  );
}
