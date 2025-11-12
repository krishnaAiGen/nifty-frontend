/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://16.171.111.4:3001/:path*',
      },
    ];
  },
}

module.exports = nextConfig

