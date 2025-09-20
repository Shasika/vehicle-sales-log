/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['mongoose', 'bcryptjs', 'sharp'],
  images: {
    remotePatterns: [],
    localPatterns: [
      {
        pathname: '/uploads/**',
        search: '',
      },
    ],
  },
  webpack: (config, { isServer, dev }) => {
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    });

    // Enhanced fix for Next.js 15 RSC module resolution
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        buffer: false,
        path: false,
        os: false,
        child_process: false,
        worker_threads: false,
      };

      // Additional module resolution fixes
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': require('path').resolve(__dirname, './src'),
      };
    }

    // Fix NextAuth.js webpack issues with Next.js 15
    config.resolve.alias = {
      ...config.resolve.alias,
      'next-auth/react$': require.resolve('next-auth/react'),
      'next-auth$': require.resolve('next-auth'),
    };

    // Enhanced chunk loading for Next.js 15
    if (dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
            vendors: {
              test: /[\\/]node_modules[\\/]/,
              priority: -10,
              reuseExistingChunk: true,
            },
            nextauth: {
              test: /[\\/]node_modules[\\/]next-auth[\\/]/,
              name: 'nextauth',
              priority: 20,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }

    // Add special handling for NextAuth imports in RSC
    if (isServer) {
      config.module = {
        ...config.module,
        rules: [
          ...config.module.rules,
          {
            test: /next-auth/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env'],
                plugins: ['@babel/plugin-transform-runtime'],
              },
            },
          },
        ],
      };
    }

    return config;
  },
};

module.exports = nextConfig;