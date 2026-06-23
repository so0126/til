/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/til',
  assetPrefix: '/til',
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
