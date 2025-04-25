/** @type {import('next').NextConfig} */
const nextConfig = {
  // fixes wallet connect dependency issue https://docs.walletconnect.com/web3modal/nextjs/about#extra-configuration
  // output: 'export',
  webpack: (config, { dev, isServer }) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    if (dev && !isServer) {
      config.devtool = 'eval-source-map';
    }
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'react-native$': 'react-native-web',
      'react-native-svg': 'react-native-svg-web',
    };
    return config;
  },
  env: {
    NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV,
    NEXT_PUBLIC_APP_BACKEND_URL: process.env.NEXT_PUBLIC_APP_BACKEND_URL,
    NEXT_PUBLIC_APP_CONTRACT_ADDRESS:
      process.env.NEXT_PUBLIC_APP_CONTRACT_ADDRESS,
    NEXT_PUBLIC_APP_SEPOLIA_ADDRESS:
      process.env.NEXT_PUBLIC_APP_SEPOLIA_ADDRESS,
    NEXT_PUBLIC_APP_LIVE_AUCTION_ADDRESS:
      process.env.NEXT_PUBLIC_APP_LIVE_AUCTION_ADDRESS,
    NEXT_PUBLIC_APP_TEST_AUCTION_ADDRESS:
      process.env.NEXT_PUBLIC_APP_TEST_AUCTION_ADDRESS,
    NEXT_PUBLIC_MOONPAY_LIVE_APIK_KEY:
      process.env.NEXT_PUBLIC_MOONPAY_LIVE_APIK_KEY,
    NEXT_PUBLIC_MOONPAY_TEST_API_KEY:
      process.env.NEXT_PUBLIC_MOONPAY_TEST_API_KEY,
    TEST_MONGODB_URI: process.env.TEST_MONGODB_URI,
    LIVE_MONGODB_URI: process.env.LIVE_MONGODB_URI,
    ADMIN_PRIVATE_KEY: process.env.ADMIN_PRIVATE_KEY,
    ADMIN_WALLET_ADDRESS: process.env.ADMIN_WALLET_ADDRESS,
    ADMIN_AWS_ACCESS_KEY_ID: process.env.ADMIN_AWS_ACCESS_KEY_ID,
    ADMIN_AWS_SECRET_ACCESS_KEY: process.env.ADMIN_AWS_SECRET_ACCESS_KEY,
    ADMIN_AWS_REGION: process.env.ADMIN_AWS_REGION,
    CLOUDWATCH_LOG_GROUP_NAME: process.env.CLOUDWATCH_LOG_GROUP_NAME,
    NEXT_PUBLIC_APP_SENDBIRD_APPID: process.env.NEXT_PUBLIC_APP_SENDBIRD_APPID,
    SENDBIRD_API_TOKEN: process.env.SENDBIRD_API_TOKEN,
    SENDBIRD_API_URL: process.env.SENDBIRD_API_URL,
    SENDBIRD_ADMIN_ID: process.env.SENDBIRD_ADMIN_ID,
    SENDBIRD_ADMIN_ACCESS_TOKEN: process.env.SENDBIRD_ADMIN_ACCESS_TOKEN,
    SENDBIRD_NOTIFICATION_API_TOKEN:
      process.env.SENDBIRD_NOTIFICATION_API_TOKEN,
    NEXT_PUBLIC_CRISP_WEBSITE_ID: process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID,
    MAILERSEND_API_TOKEN: process.env.MAILERSEND_API_TOKEN,
    MAILGUN_API_TOKEN: process.env.MAILGUN_API_TOKEN,
    JWT_SECRET: process.env.JWT_SECRET,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'vaultx-backet.s3.ap-northeast-2.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'tan-absent-fox-474.mypinata.cloud',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.vault-x.io',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'tapi.vault-x.io',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
};

export default nextConfig;
