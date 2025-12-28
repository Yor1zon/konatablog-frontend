/** @type {import('next').NextConfig} */
const defaultBackendOrigin =
  process.env.NODE_ENV === "development" ? "http://localhost:8081" : "http://konatablogbackend:8081"
const backendOrigin = (process.env.BACKEND_ORIGIN || defaultBackendOrigin).replace(/\/$/, "")

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendOrigin}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
