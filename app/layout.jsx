import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from './components/Navbar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'ye_kya.tha 💀 — Dank Memes & Clips',
  description: 'Your go-to spot for the dankest memes and viral clips. Browse, download, and vibe.',
  keywords: 'memes, funny, viral, clips, download memes, dank memes',
  openGraph: {
    title: 'ye_kya.tha 💀 — Dank Memes & Clips',
    description: 'Your go-to spot for the dankest memes and viral clips.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bangers&family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.variable}>
        <Navbar />
        <main>{children}</main>
        <footer style={{
          textAlign: 'center',
          padding: '40px 20px',
          borderTop: '1px solid rgba(191, 0, 255, 0.1)',
          marginTop: 'auto',
          fontSize: '0.85rem',
          color: '#4a4a72'
        }}>
          <p>© {new Date().getFullYear()} ye_kya.tha 💀. All rights reserved.</p>
          <p style={{ marginTop: '8px' }}>
            Follow us on <a href="https://www.instagram.com/ye_kya.tha?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" style={{ color: '#bf00ff', textDecoration: 'none' }}>Instagram</a>
          </p>
        </footer>
      </body>
    </html>
  );
}
