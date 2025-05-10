/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: false, // Disable SWC minification temporarily
  experimental: {
    forceSwcTransforms: true // Force using SWC for transforms
  }
};

export default nextConfig;