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
    const timestamp = Math.round((new Date).getTime() / 1000);
    const body = await request.json();
    const folder = 'meme-vault';

    const paramsToSign = {
      timestamp,
      folder,
    };

    if (body.tags) paramsToSign.tags = body.tags;
    if (body.context) paramsToSign.context = body.context;

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );

    return NextResponse.json({
      timestamp,
      signature,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      folder
    });
  } catch (err) {
    console.error('Signature generation error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
