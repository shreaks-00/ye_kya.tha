import { notFound } from 'next/navigation';
import SingleMemeClient from './SingleMemeClient';

async function getMeme(id) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/media/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const decoded = id.join('/');
  const meme = await getMeme(decoded);
  if (!meme) return { title: 'Meme Not Found — ye_kya.tha' };
  const title = meme.context?.custom?.caption || decoded.split('/').pop();
  return {
    title: `${title} — ye_kya.tha`,
    description: `Download this meme from ye_kya.tha for free.`,
  };
}

export default async function MemePage({ params }) {
  const { id } = await params;
  const decoded = id.join('/');
  const meme = await getMeme(decoded);
  if (!meme) notFound();
  return <SingleMemeClient meme={meme} />;
}
