
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config) => {
    // This is a workaround for a stubborn build issue where modules from
    // a removed dependency (which used OpenTelemetry) are still being resolved.
    // By aliasing them to `false`, we tell Webpack to ignore them.
    config.resolve.alias = {
        ...config.resolve.alias,
        '@opentelemetry/exporter-trace-otlp-grpc': false,
        '@opentelemetry/semantic-conventions': false,
    };
    return config;
  },
};

export default nextConfig;
