/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typedRoutes: true,
  images: {
    domains: ['localhost', '127.0.0.1'],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig