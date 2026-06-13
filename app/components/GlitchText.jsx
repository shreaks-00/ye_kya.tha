'use client';
import { useEffect, useRef } from 'react';
import styles from './GlitchText.module.css';

export default function GlitchText({ children, className = '' }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.setAttribute('data-text', el.textContent);
  }, [children]);

  return (
    <span ref={ref} className={`${styles.glitch} ${className}`} data-text={typeof children === 'string' ? children : ''}>
      {children}
    </span>
  );
}
