import { notFound } from 'next/navigation';
import SingleMemeClient from './SingleMemeClient';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function getMeme(id) {
  try {
    const result = await cloudinary.api.resource(id, {
      resource_type: 'image',
      context: true,
      tags: true,
    });
    return result;
  } catch (err) {
    try {
      const result = await cloudinary.api.resource(id, {
        resource_type: 'video',
        context: true,
        tags: true,
      });
      return result;
    } catch (err2) {
      return null;
    }
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
