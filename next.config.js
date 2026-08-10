/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Enable @/* alias resolution
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@": require("path").resolve(__dirname),
    };

    return config;
  },

  turbopack: {},
};

module.exports = nextConfig;
