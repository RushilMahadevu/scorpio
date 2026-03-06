import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    unoptimized: true,
  },
  output: "standalone",
  // Prevent firebase client SDK (incl. firebase/ai + GoogleAIBackend) from being
  // bundled into server chunks — it must stay as an external module so it is
  // never evaluated in the Node.js Cloud Run environment at module-load time.
  serverExternalPackages: ["firebase", "firebase/ai"],
};

export default nextConfig;
