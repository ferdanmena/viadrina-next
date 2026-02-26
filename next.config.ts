import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "imgcdn.bokun.tools",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;