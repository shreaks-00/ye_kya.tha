import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import { verifyAdmin } from '../../../../lib/auth';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET single media item by public_id
export async function GET(request, { params }) {
  console.log("CLOUDINARY CONFIG:", {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY ? "EXISTS" : "MISSING",
  });
  const { id } = await params;
  const publicId = id.join('/');
  console.log("API ROUTE HIT with publicId:", publicId);
  try {
    const result = await cloudinary.api.resource(publicId, {
      resource_type: 'image',
      context: true,
      tags: true,
    });
    return NextResponse.json(result);
  } catch (err) {
    try {
      const result = await cloudinary.api.resource(publicId, {
        resource_type: 'video',
        context: true,
        tags: true,
      });
      return NextResponse.json(result);
    } catch (err2) {
      console.error("Cloudinary error:", JSON.stringify(err2));
      return NextResponse.json({ error: err2.error?.message || err2.message || "Unknown error" }, { status: 404 });
    }
  }
}

// DELETE — admin only
export async function DELETE(request, { params }) {
  const authErr = await verifyAdmin(request);
  if (authErr) return authErr;

  const { id } = await params;
  const publicId = id.join('/');
  const { searchParams } = new URL(request.url);
  const resourceType = searchParams.get('resource_type') || 'image';

  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    return NextResponse.json({ result });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH — update title/tags/caption — admin only
export async function PATCH(request, { params }) {
  const authErr = await verifyAdmin(request);
  if (authErr) return authErr;

  const { id } = await params;
  const publicId = id.join('/');
  const body = await request.json();
  const { caption, tags, resource_type = 'image' } = body;

  try {
    const updates = {};
    if (caption !== undefined) {
      await cloudinary.uploader.add_context(`caption=${caption}`, [publicId], { resource_type });
    }
    if (tags !== undefined) {
      await cloudinary.uploader.replace_tag(tags.join(','), [publicId], { resource_type });
    }
    return NextResponse.json({ success: true, updates });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
