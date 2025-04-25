import { getContract } from 'thirdweb';
import { baseSepolia, base } from 'thirdweb/chains';
import { base as viemBase, baseSepolia as viemBaseSepolia } from 'viem/chains';
import { client } from './client';
import { privateKeyToAccount } from 'thirdweb/wallets';

// get a contract
export const isDev = process.env.NEXT_PUBLIC_ENV === 'development';

const addr = isDev
  ? process.env.NEXT_PUBLIC_APP_SEPOLIA_ADDRESS
  : process.env.NEXT_PUBLIC_APP_CONTRACT_ADDRESS;

const auctionAddr = isDev
  ? process.env.NEXT_PUBLIC_APP_TEST_AUCTION_ADDRESS
  : process.env.NEXT_PUBLIC_APP_LIVE_AUCTION_ADDRESS;

export const explorer = isDev
  ? 'https://sepolia.basescan.org/'
  : 'https://basescan.org/';
export const chain = isDev ? baseSepolia : base;
export const viemChain = isDev ? viemBaseSepolia : viemBase;
export const address = addr;
export const auctionAddress = auctionAddr;

export const contract = getContract({
  client,
  chain,
  address: addr,
});

export const sepoliaERC20Contract = getContract({
  client,
  chain: baseSepolia,
  address: '0x4200000000000000000000000000000000000006',
});

export const auctionContract = getContract({
  client,
  chain,
  address: auctionAddr,
});

export const maxBlocksWaitTime = 300;

export const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY;
export const adminWalletAddress = process.env.ADMIN_WALLET_ADDRESS;
export const adminAccount = privateKeyToAccount({
  client,
  privateKey: adminPrivateKey,
});
