import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import { verifyAdmin } from '../../../lib/auth';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  const authErr = await verifyAdmin(request);
  if (authErr) return authErr;

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const caption = formData.get('caption') || '';
    const tags = formData.get('tags') || '';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataUri = `data:${file.type};base64,${base64}`;

    const isVideo = file.type.startsWith('video/');

    const uploadOptions = {
      folder: 'meme-vault',
      resource_type: isVideo ? 'video' : 'image',
      context: caption ? `caption=${caption}` : undefined,
      tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : undefined,
    };

    const result = await cloudinary.uploader.upload(dataUri, uploadOptions);

    return NextResponse.json({
      success: true,
      public_id: result.public_id,
      secure_url: result.secure_url,
      resource_type: result.resource_type,
    });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
