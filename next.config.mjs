/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    unoptimized: true,
  },
  output: "standalone",
  // Keep firebase packages external so they are never bundled into server chunks.
  // IMPORTANT: Only list the main 'firebase-admin' entry point here, NOT the
  // subpaths (firebase-admin/app, etc). Listing subpaths causes Turbopack to
  // create separate module instances that don't share the same app registry.
  serverExternalPackages: [
    "firebase",
    "firebase-admin",
  ],
};

export default nextConfig;
