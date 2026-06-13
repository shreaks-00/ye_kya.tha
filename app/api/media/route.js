import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '24');
  const cursor = searchParams.get('cursor');
  const sortBy = searchParams.get('sort') || 'created_at';
  const typeFilter = searchParams.get('type') || 'all'; // 'all', 'image', 'video'

  try {
    const searchOptions = {
      max_results: limit,
      with_field: ['context', 'tags'],
      sort_by: [[sortBy, 'desc']],
    };

    if (cursor) searchOptions.next_cursor = cursor;

    let expression = 'folder:meme-vault';
    if (typeFilter === 'image') expression += ' AND resource_type:image';
    else if (typeFilter === 'video') expression += ' AND resource_type:video';

    searchOptions.expression = expression;

    const result = await cloudinary.search
      .expression(expression)
      .sort_by(sortBy, 'desc')
      .max_results(limit)
      .with_field('context')
      .with_field('tags')
      .next_cursor(cursor || undefined)
      .execute();

    return NextResponse.json({
      resources: result.resources || [],
      next_cursor: result.next_cursor || null,
      total_count: result.total_count || 0,
    });
  } catch (err) {
    console.error('GET /api/media error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
