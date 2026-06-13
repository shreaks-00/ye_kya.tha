/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
  // Allow cross-origin requests from your deployed domain in dev
  allowedDevOrigins: ['192.168.29.159'],
};

module.exports = nextConfig;
