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
};

export default nextConfig;
