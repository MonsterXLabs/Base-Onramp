import { privateKeyToAccount } from 'thirdweb/wallets';
import { client } from './client';

export const monsterDevAccount = privateKeyToAccount({
  client,
  privateKey: process.env.MONSTERDEV_PRIVATE_KEY,
});

export const jamesAccount = privateKeyToAccount({
  client,
  privateKey: process.env.JAMES_PRIVATE_KEY,
});
