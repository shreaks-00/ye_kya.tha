# ye_kya.tha 💀

> The Internet's Dankest Vault of Memes

A full-stack meme download website built with **Next.js 15** and **Cloudinary** — built for the Instagram page [@ye_kya.tha](https://www.instagram.com/ye_kya.tha).

## Features

- 🎭 **Public Meme Gallery** — browse, search, filter by image/video
- ⬇️ **One-click Downloads** — no watermarks, no sign-up
- 🔐 **Admin Panel** — password-protected dashboard to upload, manage, and delete content
- ☁️ **Cloudinary Storage** — all images and videos stored and served via Cloudinary CDN
- 📱 **Fully Mobile Responsive**
- 🌑 **Dark Neon Aesthetic** — funky purple/pink/green vibes

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Vanilla CSS Modules
- **Storage:** Cloudinary
- **Auth:** JWT via `jose` (httpOnly cookies)
- **Fonts:** Bangers, Space Grotesk, Inter (Google Fonts)

## Deployment (Vercel)

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → Import this repository
3. Add the following **Environment Variables** in Vercel project settings:

| Variable | Value |
|---|---|
| `CLOUDINARY_CLOUD_NAME` | your cloud name |
| `CLOUDINARY_API_KEY` | your api key |
| `CLOUDINARY_API_SECRET` | your api secret |
| `ADMIN_PASSWORD` | your admin password |
| `JWT_SECRET` | a long random secret string |
| `NEXT_PUBLIC_BASE_URL` | `https://your-vercel-domain.vercel.app` |

4. Deploy!

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Admin panel: [http://localhost:3000/admin](http://localhost:3000/admin)
