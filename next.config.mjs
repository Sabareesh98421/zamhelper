/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/a/**",
      },
      {
        protocol: "https",
        hostname: "zamhelper--zamhelper-240302.asia-southeast1.hosted.app",
        port: "",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/:path*",
        destination: "/:path*",
      },
      {
        source: "/uploads",
        destination: "http://localhost:3000/admin/uploads",
      },
    ];
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  serverExternalPackages: ['pdf-parse', 'sharp'], // Prevent bundling of native/FS-reliant modules
};

export default nextConfig;
