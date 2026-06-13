import Link from 'next/link';
import styles from './page.module.css';
import MemeCard from './components/MemeCard';
import ScrollReveal from './components/ScrollReveal';
import AnimatedCounter from './components/AnimatedCounter';
import GlitchText from './components/GlitchText';

export const dynamic = 'force-dynamic';

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function getMemes(type) {
  try {
    let expression = 'resource_type:image OR resource_type:video';
    if (type === 'video') expression = 'resource_type:video';
    if (type === 'image') expression = 'resource_type:image';

    const result = await cloudinary.search
      .expression(expression)
      .sort_by('created_at', 'desc')
      .max_results(6)
      .with_field('context')
      .with_field('tags')
      .execute();
    return result.resources || [];
  } catch {
    return [];
  }
}

export default async function Home() {
  const allMemes = await getMemes('all');
  const videos = await getMemes('video');
  const images = await getMemes('image');

  // Helper component to render a section
  const MemeSection = ({ title, icon, items }) => (
    <section className={`section ${styles.featuredSection}`}>
      <div className="container">
        <ScrollReveal>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              {icon} <span className="gradient-text">{title}</span>
            </h2>
            <Link href="/memes" className="btn btn-secondary btn-sm">
              See All →
            </Link>
          </div>
        </ScrollReveal>

        {items.length > 0 ? (
          <div className="meme-grid">
            {items.map((item, i) => (
              <ScrollReveal key={item.public_id} delay={i * 80}>
                <MemeCard item={item} />
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <span className={styles.emptyEmoji}>🐣</span>
            <p>Memes are being loaded into the vault...</p>
          </div>
        )}
      </div>
    </section>
  );

  return (
    <div className={styles.page}>
      {/* ---- Animated background ---- */}
      <div className={styles.bgOrbs}>
        <div className={styles.orb1}></div>
        <div className={styles.orb2}></div>
        <div className={styles.orb3}></div>
      </div>

      {/* ---- Hero ---- */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              <span>🔥</span>
              <span>Fresh Memes Daily</span>
            </div>

            <h1 className={styles.heroTitle}>
              The Internet's
              <br />
              <GlitchText className="gradient-text">Dankest Vault</GlitchText>
              <br />
              of Memes 💀
            </h1>

            <p className={styles.heroSub}>
              Handpicked memes and viral clips from our Instagram meme page{' '}
              <strong style={{ color: '#bf00ff' }}>@ye_kya.tha</strong>.
              Browse, laugh, and download — no watermarks, no BS, no sign-up.
            </p>

            <div className={styles.heroCta}>
              <Link href="/memes" className="btn btn-primary">Browse Memes 🚀</Link>
              <a
                href="https://www.instagram.com/ye_kya.tha?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                target="_blank" rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                Follow on IG 📸
              </a>
              <Link href="/memes" className="btn btn-secondary" id="hero-download-btn">
                ⬇ Download Free
              </Link>
            </div>

            <div className={styles.heroStats}>
              <div className={styles.stat}>
                <span className={styles.statNum}><AnimatedCounter target={100} suffix="+" /></span>
                <span className={styles.statLabel}>Memes</span>
              </div>
              <div className={styles.statDivider}></div>
              <div className={styles.stat}>
                <span className={styles.statNum}>FREE</span>
                <span className={styles.statLabel}>Downloads</span>
              </div>
              <div className={styles.statDivider}></div>
              <div className={styles.stat}>
                <span className={styles.statNum}>Daily</span>
                <span className={styles.statLabel}>Updates</span>
              </div>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.floatingCard}>
              <div className={styles.floatingCardInner}>
                <span className={styles.bigEmoji}>😂</span>
                <span className={styles.floatLabel}>ye_kya.tha</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Ticker ---- */}
      <div className="marquee-wrapper">
        <div className="marquee-track">
          {'💀 DANK MEMES \u00a0•\u00a0 🔥 VIRAL CLIPS \u00a0•\u00a0 😂 FREE DOWNLOADS \u00a0•\u00a0 🐸 RELATABLE CONTENT \u00a0•\u00a0 🚀 NO WATERMARK \u00a0•\u00a0 📸 @ye_kya.tha ON IG \u00a0•\u00a0 💀 DANK MEMES \u00a0•\u00a0 🔥 VIRAL CLIPS \u00a0•\u00a0 😂 FREE DOWNLOADS \u00a0•\u00a0 🐸 RELATABLE CONTENT \u00a0•\u00a0 🚀 NO WATERMARK \u00a0•\u00a0 📸 @ye_kya.tha ON IG \u00a0•\u00a0 '}
        </div>
      </div>

      {/* ---- Categories/Sections ---- */}
      <div className={styles.sectionsWrapper}>
        <MemeSection title="Latest Drops" icon="🔥" items={allMemes} />
        <MemeSection title="Trending Videos" icon="🎬" items={videos} />
        <MemeSection title="Fresh Memes" icon="🖼️" items={images} />
        
        <div className={styles.viewMoreGlobal}>
          <Link href="/memes" className="btn btn-primary" id="view-more-global">
            View All Vault Items 🎭
          </Link>
        </div>
      </div>

      {/* ---- About Section ---- */}
      <section className={`section ${styles.aboutSection}`}>
        <div className="container">
          <div className={styles.aboutCard}>
            <div className={styles.aboutContent}>
              <h2 className={styles.aboutTitle}>What is ye_kya.tha? 🤔</h2>
              <p className={styles.aboutText}>
                We started on Instagram as a small meme page, and now we're bringing the absolute <strong>dankest</strong>, most <strong>unhinged</strong> content straight to your browser.
              </p>
              <p className={styles.aboutText}>
                Tired of screenshotting memes or doing a whole screen-record just to send something funny in your group chat? Same. That's exactly why this vault exists — browse, search, and instantly download any meme or clip in full quality. Zero watermarks. No cap.
              </p>
              <p className={styles.aboutText}>
                The vault gets updated regularly, so bookmark this and come back whenever you need fresh ammo for your chats. 💀
              </p>
              <div className={styles.aboutFooter}>
                <span className={styles.aboutSignature}>- The Admin 💀</span>
                <a
                  href="https://www.instagram.com/ye_kya.tha?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                  target="_blank" rel="noopener noreferrer"
                  className={styles.aboutIgLink}
                >
                  📸 @ye_kya.tha
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---- How It Works ---- */}
      <section className={`section ${styles.howSection}`}>
        <div className="container">
          <ScrollReveal>
            <h2 className={`${styles.sectionTitle} ${styles.centeredTitle}`}>How it works 🛠️</h2>
            <p className={styles.centeredSub}>Three steps. That's it. No cap.</p>
          </ScrollReveal>
          <div className={styles.stepsGrid}>
            {[
              { num: '01', icon: '🔍', title: 'Browse the Vault', desc: 'Scroll through the meme gallery, search by keyword, or filter by image/video.' },
              { num: '02', icon: '👁️', title: 'Pick Your Meme', desc: 'Click any meme to open the full-quality view — images and videos both supported.' },
              { num: '03', icon: '⬇️', title: 'Download Free', desc: 'Hit the download button. Saves straight to your device. No watermarks, no login.' },
            ].map((step, i) => (
              <ScrollReveal key={step.num} delay={i * 120}>
                <div className={styles.stepCard}>
                  <div className={styles.stepNum}>{step.num}</div>
                  <div className={styles.stepIcon}>{step.icon}</div>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDesc}>{step.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Categories ---- */}
      <section className={`section ${styles.catsSection}`}>
        <div className="container">
          <ScrollReveal>
            <h2 className={`${styles.sectionTitle} ${styles.centeredTitle}`}>What kind of memes? 😤</h2>
            <p className={styles.centeredSub}>We cover the whole spectrum of Indian and global meme culture</p>
          </ScrollReveal>
          <ScrollReveal delay={150}>
            <div className={styles.catsGrid}>
              {[
                { emoji: '😂', label: 'Relatable' },
                { emoji: '💀', label: 'Dark Humor' },
                { emoji: '🐸', label: 'Classic Formats' },
                { emoji: '🇮🇳', label: 'Desi Memes' },
                { emoji: '🎬', label: 'Reels & Clips' },
                { emoji: '🔥', label: 'Trending' },
                { emoji: '🤡', label: 'Cursed' },
                { emoji: '💯', label: 'Viral' },
              ].map((cat) => (
                <Link href="/memes" key={cat.label} className={styles.catChip}>
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                </Link>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ---- Instagram Follow Section ---- */}
      <section className={`section ${styles.igSection}`}>
        <div className="container">
          <ScrollReveal>
          <div className={styles.igBox}>
            <div className={styles.igLeft}>
              <div className={styles.igHandle}>@ye_kya.tha</div>
              <h2 className={styles.igTitle}>Follow us on Instagram 📸</h2>
              <p className={styles.igDesc}>
                This website is the download hub — but the main show is on Instagram. Follow us for daily meme drops, stories, and the freshest content before it even makes it to the vault.
              </p>
              <a
                href="https://www.instagram.com/ye_kya.tha?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                target="_blank" rel="noopener noreferrer"
                className={`btn ${styles.igBtn}`}
              >
                📸 Open Instagram Page
              </a>
            </div>
            <div className={styles.igRight}>
              <div className={styles.igCardMock}>
                <div className={styles.igMockHeader}>
                  <div className={styles.igMockAvatar}>💀</div>
                  <div>
                    <div className={styles.igMockName}>ye_kya.tha</div>
                    <div className={styles.igMockSub}>Meme Page • Instagram</div>
                  </div>
                </div>
                <div className={styles.igMockGrid}>
                  {['😂', '💀', '🔥', '🐸', '🤡', '💯'].map((e, i) => (
                    <div key={i} className={styles.igMockCell}>{e}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ---- Features strip ---- */}
      <section className={`section ${styles.featuresSection}`}>
        <div className="container">
          <div className={styles.featuresGrid}>
            {[
              { icon: '💾', title: 'Free Downloads', desc: 'Download any meme or clip instantly, no sign-up required' },
              { icon: '🔥', title: 'Daily Updates', desc: 'Fresh memes added regularly straight from our Instagram' },
              { icon: '🎬', title: 'Images & Videos', desc: 'Full support for both meme images and viral video clips' },
              { icon: '📱', title: 'Mobile Ready', desc: 'Works perfectly on your phone for on-the-go meme access' },
            ].map((f) => (
              <div key={f.title} className={styles.featureCard}>
                <span className={styles.featureIcon}>{f.icon}</span>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section className={`section ${styles.ctaSection}`}>
        <div className="container">
          <div className={styles.ctaBox}>
            <h2 className={styles.ctaTitle}>Ready to raid the vault? 💀</h2>
            <p className={styles.ctaSub}>All memes are free. All downloads are instant. Zero watermarks.</p>
            <div className={styles.ctaBtns}>
              <Link href="/memes" className="btn btn-primary" id="cta-browse-btn">
                Browse All Memes 🎭
              </Link>
              <a
                href="https://www.instagram.com/ye_kya.tha?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                target="_blank" rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                Follow on IG 📸
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
