/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  images: {
    unoptimized: true,
  },
  output: "standalone",
  // Since we use eval('require') for Firebase Admin (to bypass Turbopack's
  // hashing bug in Next.js 16), we don't need to specify it as external here.
  serverExternalPackages: [
    "react-icons",
    "@polar-sh/sdk",
  ],
};

export default nextConfig;
