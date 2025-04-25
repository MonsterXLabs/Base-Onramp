import { Account } from 'thirdweb/wallets';
import { client } from './client';
import {
  parseEventLogs,
  prepareContractCall,
  prepareEvent,
  readContract,
  sendTransaction,
  waitForReceipt,
} from 'thirdweb';
import {
  auctionContract,
  chain,
  contract,
  maxBlocksWaitTime,
} from './contract';
import { INFTVoucher } from '@/types';

export const createAuction = async (
  tokenId: bigint,
  minBid: bigint,
  duration: bigint,
  account: Account,
) => {
  const transaction = await prepareContractCall({
    contract: contract,
    method:
      'function createAuction(uint256 tokenId, uint256 minBid, uint256 duration)',
    params: [BigInt(tokenId), minBid, duration],
  });
  const { transactionHash } = await sendTransaction({
    transaction,
    account,
  });

  const receipt = await waitForReceipt({
    client,
    chain,
    transactionHash,
    maxBlocksWaitTime,
  });

  const acutionCreateEvent = prepareEvent({
    signature:
      'event AuctionCreated(uint256 auctionId, address seller, uint256 tokenId, uint256 minBid, uint256 endTime)',
  });

  const events = await parseEventLogs({
    logs: receipt.logs,
    events: [acutionCreateEvent],
  });

  return events
    ? {
        ...events[0].args,
        transactionHash,
      }
    : null;
};

export const createFreeMintAuction = async (
  voucher: Omit<INFTVoucher, 'signature'> & { signature: `0x${string}` },
  minBid: bigint,
  duration: bigint,
  account: Account,
) => {
  const transaction = await prepareContractCall({
    contract,
    method:
      'function createFreeMintAuction((uint256 curationId, string tokenURI, uint256 price, address royaltyWallet, uint256 royaltyPercentage, address[] paymentWallets, uint256[] paymentPercentages, bytes signature) voucher, uint256 minBid, uint256 duration) payable',
    params: [voucher, minBid, duration],
  });
  const { transactionHash } = await sendTransaction({
    transaction,
    account,
  });

  const receipt = await waitForReceipt({
    client,
    chain,
    transactionHash,
    maxBlocksWaitTime,
  });

  const acutionCreateEvent = prepareEvent({
    signature:
      'event AuctionCreated(uint256 auctionId, address seller, uint256 tokenId, uint256 minBid, uint256 endTime)',
  });

  const events = await parseEventLogs({
    logs: receipt.logs,
    events: [acutionCreateEvent],
  });

  return events
    ? {
        ...events[0].args,
        transactionHash,
      }
    : null;
};

export const bidAuction = async (
  auctionId: number,
  amount: bigint,
  account: Account,
) => {
  const transaction = await prepareContractCall({
    contract: auctionContract,
    method: 'function bid(uint256 _auctionId) payable',
    params: [BigInt(auctionId)],
    value: amount,
  });
  const { transactionHash } = await sendTransaction({
    transaction,
    account,
  });

  const receipt = await waitForReceipt({
    client,
    chain,
    transactionHash,
    maxBlocksWaitTime,
  });

  const bidPlacedEvent = prepareEvent({
    signature:
      'event BidPlaced(uint256 auctionId, address bidder, uint256 amount)',
  });

  const events = await parseEventLogs({
    logs: receipt.logs,
    events: [bidPlacedEvent],
  });

  return events
    ? {
        ...events[0].args,
        transactionHash,
      }
    : null;
};

export const cancelAuction = async (auctionId: number, account: Account) => {
  const transaction = await prepareContractCall({
    contract: auctionContract,
    method: 'function cancelAuction(uint256 _auctionId)',
    params: [BigInt(auctionId)],
  });
  const { transactionHash } = await sendTransaction({
    transaction,
    account,
  });

  const receipt = await waitForReceipt({
    client,
    chain,
    transactionHash,
    maxBlocksWaitTime,
  });

  const auctionCancelledEvent = prepareEvent({
    signature: 'event AuctionCancelled(uint256 auctionId, address seller)',
  });

  const events = await parseEventLogs({
    logs: receipt.logs,
    events: [auctionCancelledEvent],
  });

  return events
    ? {
        ...events[0].args,
        transactionHash,
      }
    : null;
};

export const endAuction = async (auctionId: number, account: Account) => {
  const transaction = await prepareContractCall({
    contract: auctionContract,
    method: 'function endAuction(uint256 _auctionId)',
    params: [BigInt(auctionId)],
  });
  const { transactionHash } = await sendTransaction({
    transaction,
    account,
  });

  const receipt = await waitForReceipt({
    client,
    chain,
    transactionHash,
    maxBlocksWaitTime,
  });

  const auctionEscrowedEvent = prepareEvent({
    signature:
      'event AuctionEscrowed(uint256 auctionId, address winner, uint256 amount)',
  });

  const auctionNoBidEvent = prepareEvent({
    signature: 'event AuctionNoBids(uint256 auctionId)',
  });

  const events = await parseEventLogs({
    logs: receipt.logs,
    events: [auctionEscrowedEvent, auctionNoBidEvent],
  });

  return events
    ? {
        events,
        transactionHash,
      }
    : null;
};

export const releaseEscrow = async (auctionId: number, account: Account) => {
  const transaction = await prepareContractCall({
    contract: auctionContract,
    method: 'function releaseEscrow(uint256 _auctionId)',
    params: [BigInt(auctionId)],
  });

  const { transactionHash } = await sendTransaction({
    transaction,
    account,
  });

  const receipt = await waitForReceipt({
    client,
    chain,
    transactionHash,
    maxBlocksWaitTime,
  });

  const escrow = prepareEvent({
    signature: 'event EscrowReleased(uint256 auctionId, address seller)',
  });

  const events = await parseEventLogs({
    logs: receipt.logs,
    events: [escrow],
  });

  return events
    ? {
        ...events[0].args,
        transactionHash,
      }
    : null;
};

export const auctionCount = async () => {
  const data = await readContract({
    contract: auctionContract,
    method: 'function auctionCount() view returns (uint256)',
    params: [],
  });

  return data;
};

export const auctionInfo = async (auctionId: number) => {
  const data = await readContract({
    contract: auctionContract,
    method:
      'function auctions(uint256) view returns (address seller, uint256 tokenId, uint256 minBid, uint256 highestBid, address highestBidder, uint256 endTime, uint8 status)',
    params: [BigInt(auctionId)],
  });

  return data;
};

export const minDuration = async () => {
  const data = await readContract({
    contract: auctionContract,
    method: 'function minAuctionDuration() view returns (uint256)',
    params: [],
  });

  return data;
};

export const maxDuration = async () => {
  const data = await readContract({
    contract: auctionContract,
    method: 'function maxAuctionDuration() view returns (uint256)',
    params: [],
  });

  return data;
};
