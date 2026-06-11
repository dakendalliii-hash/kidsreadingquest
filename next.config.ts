// kidsreadingquest/next.config.js
const nextConfig = {
  experimental: {
    serverActions: {}, // keep your existing experimental flag
  },
  // ✅ Add these lines below
  output: "standalone", // ensures Vercel uses Node runtime
  serverRuntimeConfig: {
    runtime: "nodejs", // forces Node instead of Edge
  },
};

export default nextConfig;
