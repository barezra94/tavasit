export default {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com'
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com'
      }
    ]
  },
  // Enable source maps for better debugging (only in development)
  productionBrowserSourceMaps: false,
  // Enable React strict mode for better debugging
  reactStrictMode: true,
  // Enable SWC minification for better performance
  swcMinify: true,
  // Optimize for production
  compress: true,
  // Disable x-powered-by header for security
  poweredByHeader: false,
  // Environment variables
  env: {
    NODE_ENV: process.env.NODE_ENV || 'development'
  }
};
