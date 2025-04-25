import { isDev } from './contract';

export const moonpayApiKey = isDev
  ? process.env.NEXT_PUBLIC_MOONPAY_TEST_API_KEY
  : process.env.NEXT_PUBLIC_MOONPAY_LIVE_API_KEY;
