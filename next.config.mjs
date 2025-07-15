/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  serverActions: {
    bodySizeLimit: '10mb',
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'logowik.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.logowik.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;