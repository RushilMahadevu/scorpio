/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  distDir: process.env.SCORPIO_BUILD_DIR || ".next",
  images: {
  },
  output: "standalone",
};

export default nextConfig;
