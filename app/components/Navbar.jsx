'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const isAdmin = pathname.startsWith('/admin');
  if (isAdmin) return null;

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>💀</span>
          <span className={styles.logoText}>ye_kya.tha</span>
        </Link>

        <div className={`${styles.links} ${menuOpen ? styles.open : ''}`}>
          <Link href="/" className={`${styles.link} ${pathname === '/' ? styles.active : ''}`}
            onClick={() => setMenuOpen(false)}>
            Home
          </Link>
          <Link href="/memes" className={`${styles.link} ${pathname === '/memes' ? styles.active : ''}`}
            onClick={() => setMenuOpen(false)}>
            Memes
          </Link>
          <a href="https://www.instagram.com/ye_kya.tha?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" 
             target="_blank" rel="noopener noreferrer" 
             className={styles.link}
             onClick={() => setMenuOpen(false)}>
             📸 Instagram
          </a>
          <Link href="/memes" className={`${styles.link} btn btn-primary btn-sm`}
            onClick={() => setMenuOpen(false)}>
            ⬇ Download
          </Link>
        </div>

        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          id="nav-hamburger"
        >
          <span className={menuOpen ? styles.barOpen : ''}></span>
          <span className={menuOpen ? styles.barOpen : ''}></span>
          <span className={menuOpen ? styles.barOpen : ''}></span>
        </button>
      </div>
    </nav>
  );
}
