/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['framer-motion'],
  webpack: (config) => {
    config.module.rules.push({
      test: /framer-motion/,
      sideEffects: false
    });
    return config;
  }
};

module.exports = nextConfig; 