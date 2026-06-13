const publicId = 'meme-vault/some-image';
fetch(`http://localhost:3000/api/media/${encodeURIComponent(publicId)}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ caption: 'Updated title!', tags: ['test'], resource_type: 'image' })
}).then(res => res.json()).then(console.log).catch(console.error);
