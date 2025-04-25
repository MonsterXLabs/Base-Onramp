import {
  Address,
  parseEventLogs,
  prepareContractCall,
  prepareEvent,
  readContract,
  sendTransaction,
  waitForReceipt,
  ZERO_ADDRESS,
} from 'thirdweb';
import {
  address,
  chain,
  contract,
  explorer,
  maxBlocksWaitTime,
} from './contract';
import { Account } from 'thirdweb/wallets';
import { client } from './client';
import {
  IBuyerInfo,
  INFTVoucher,
  IRoyaltyDetails,
  ITokenDetail,
  PaymentSplitType,
} from '@/types';
import { formatEther, parseEther } from 'viem';
import { checksumAddress } from 'thirdweb/utils';
import { getYouTubeVideoId } from '../utils/helpers';

export const createCollection = async (
  // name: string,
  // uri: string,
  account: Account,
) => {
  const transaction = await prepareContractCall({
    contract,
    method: 'function createCuration(address curator, bool option)',
    params: [account?.address, true],
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

  // get event log
  const createCollectionEvent = prepareEvent({
    signature: 'event CreateCuration(address curator, uint256 id)',
  });

  const events = parseEventLogs({
    logs: receipt.logs,
    events: [createCollectionEvent],
  });

  let ret = null;
  if (events.length > 0)
    ret = {
      tokenId: Number(events[0].args.id),
      transactionHash: events[0].transactionHash,
    };

  return ret;
};

export const isCurator = async (address: string) => {
  const data = await readContract({
    contract,
    method: 'function isCurator(address) view returns (bool)',
    params: [address],
  });

  return data;
};

export interface IListAsset {
  curationId: number;
  tokenURI: string;
  price: bigint;
  royaltyWallet: Address | '';
  royaltyPercentage: bigint;
  paymentSplits: Array<PaymentSplitType>;
  account: Account;
}

export const listAsset = async ({
  curationId,
  tokenURI,
  price,
  royaltyWallet,
  royaltyPercentage,
  paymentSplits,
  account,
}: IListAsset) => {
  const transaction = await prepareContractCall({
    contract,
    method:
      'function listAsset(uint256 curationId, string tokenURI, uint256 price, address royaltyWallet, uint256 royaltyPercentage, (address paymentWallet, uint256 paymentPercentage)[] paymentSplits)',
    params: [
      BigInt(curationId),
      tokenURI,
      BigInt(price),
      royaltyWallet,
      BigInt(royaltyPercentage),
      paymentSplits,
    ],
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

  const ListedEvent = prepareEvent({
    signature: 'event Listed(uint256 indexed tokenId)',
  });

  const events = parseEventLogs({
    logs: receipt.logs,
    events: [ListedEvent],
  });
  return events
    ? {
        ...events[0].args,
        transactionHash,
      }
    : null;
};

export const getPaymentSplitsByTokenId = async (tokenId: number) => {
  const data = await readContract({
    contract,
    method:
      'function getPaymentSplitsByTokenId(uint256 tokenId) view returns ((address paymentWallet, uint256 paymentPercentage)[])',
    params: [BigInt(tokenId)],
  });
  return data;
};

export const protocolFee = async () => {
  const fee = await readContract({
    contract,
    method: 'function protocolFee() view returns (uint256)',
    params: [],
  });
  return fee;
};

export const deliveryTime = async () => {
  const data = await readContract({
    contract,
    method: 'function deliverTime() view returns (uint256)',
    params: [],
  });
  return data;
};

export const tokenDetail = async (tokenId: bigint) => {
  const detail = await readContract({
    contract,
    method:
      'function tokenDetails(uint256) view returns (uint256 tokenId, uint256 curationId, address owner, uint256 price, uint256 shipTime, (address buyer, uint256 amount) buyerInfo, (address royaltyWallet, uint256 royaltyPercentage) royalty, uint8 status)',
    params: [BigInt(tokenId)],
  });

  const tokenDetail: ITokenDetail = {
    tokenId: Number(detail[0]),
    curationId: Number(detail[1]),
    owner: detail[2] as Address,
    usdAmount: detail[3],
    shipTime: detail[4],
    buyerInfo: detail[5] as IBuyerInfo,
    royalty: detail[6] as IRoyaltyDetails,
    status: Number(detail[7]),
  };
  return tokenDetail;
};

export const purchaseAsset = async (
  tokenId: bigint,
  amount: bigint,
  recipient: Address,
  account: Account,
) => {
  const detail = await tokenDetail(tokenId);

  // get
  const transaction = await prepareContractCall({
    contract,
    method:
      'function purchaseAsset(uint256 tokenId, address recipient) payable',
    params: [tokenId, recipient],
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

  const AssetPurchasedEvent = prepareEvent({
    signature: 'event AssetPurchased(uint256 indexed tokenId)',
  });

  const events = parseEventLogs({
    logs: receipt.logs,
    events: [AssetPurchasedEvent],
  });

  return events
    ? {
        ...events[0].args,
        transactionHash,
      }
    : null;
};

export const getVoucherSignature = async (
  NFTVoucher: Omit<INFTVoucher, 'signature'>,
  account: Account,
) => {
  // Define the domain for EIP-712 signature
  const domain = {
    name: 'MonsterXNFT-Voucher',
    version: '1',
    verifyingContract: address,
    chainId: chain.id,
  };

  // Define the types for the NFTVoucher
  const types = {
    NFTVoucher: [
      { name: 'curationId', type: 'uint256' },
      { name: 'tokenURI', type: 'string' },
      { name: 'price', type: 'uint256' },
      { name: 'royaltyWallet', type: 'address' },
      { name: 'royaltyPercentage', type: 'uint256' },
      { name: 'paymentWallets', type: 'address[]' },
      { name: 'paymentPercentages', type: 'uint256[]' },
    ],
  };

  const signature = await account.signTypedData({
    domain,
    types,
    message: NFTVoucher,
    primaryType: 'NFTVoucher',
  });

  // check signature
  const signerAddr = await readContract({
    contract,
    method:
      'function _verify((uint256 curationId, string tokenURI, uint256 price, address royaltyWallet, uint256 royaltyPercentage, address[] paymentWallets, uint256[] paymentPercentages, bytes signature) voucher) view returns (address)',
    params: [{ ...NFTVoucher, signature }],
  });
  if (signerAddr !== checksumAddress(account?.address))
    throw new Error('signature is not valid.');

  return signature;
};

export const purchaseAssetBeforeMint = async (
  voucher: Omit<INFTVoucher, 'signature'> & { signature: `0x${string}` },
  amount: bigint,
  recipient: Address,
  account: Account,
) => {
  const transaction = await prepareContractCall({
    contract,
    method:
      'function purchaseAssetBeforeMint((uint256 curationId, string tokenURI, uint256 price, address royaltyWallet, uint256 royaltyPercentage, address[] paymentWallets, uint256[] paymentPercentages, bytes signature) voucher, address recipient) payable',
    params: [voucher, recipient],
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

  const TransferEvent = prepareEvent({
    signature:
      'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
  });

  const events = parseEventLogs({
    logs: receipt.logs,
    events: [TransferEvent],
  });

  return events
    ? {
        ...events[0].args,
        transactionHash,
      }
    : null;
};
export const getExplorerURL = (
  type: 'address' | 'transaction' | 'nft',
  value: string,
) => {
  if (type === 'address') return `${explorer}address/${value}`;
  if (type === 'transaction') return `${explorer}tx/${value}`;
  if (type === 'nft') return `${explorer}nft/${contract?.address}/${value}`;
  return '';
};

export const getTokenAmount = async (
  usdAmount: string,
  unit: 'Ether' | 'Wei' = 'Ether',
) => {
  const tokenAmount = await readContract({
    contract,
    method:
      'function getTokenAmount(uint256 usdAmount, address token) view returns (uint256)',
    params: [parseEther(usdAmount), ZERO_ADDRESS],
  });

  if (unit === 'Ether') return formatEther(tokenAmount);

  return tokenAmount;
};

export const getUsdAmount = async (tokenAmount: bigint) => {
  const centUnit = await getTokenAmount('0.01', 'Wei');
  const usdAmount = (Number(tokenAmount / (centUnit as bigint)) / 100).toFixed(
    2,
  );
  return usdAmount;
};

export const unlistAsset = async (tokenId: number, account: Account) => {
  const transaction = await prepareContractCall({
    contract,
    method: 'function unlistAsset(uint256 tokenId)',
    params: [BigInt(tokenId)],
  });
  const { transactionHash } = await sendTransaction({
    transaction,
    account,
  });
  return transactionHash;
};

export const resaleAsset = async (
  tokenId: number,
  price: bigint,
  account: Account,
) => {
  // check if approved for all
  const isApproved = await isApprovedForAll(
    account.address as Address,
    contract.address as Address,
  );
  if (!isApproved)
    await setApprovedForAll(contract.address as Address, true, account);
  const transaction = await prepareContractCall({
    contract,
    method: 'function reSaleAsset(uint256 tokenId, uint256 price)',
    params: [BigInt(tokenId), price],
  });
  const { transactionHash } = await sendTransaction({
    transaction,
    account,
  });

  await waitForReceipt({
    client,
    chain,
    transactionHash,
    maxBlocksWaitTime,
  });
  return transactionHash;
};

export const setApproveToken = async (
  tokenId: number,
  address: Address,
  account: Account,
) => {
  const transaction = await prepareContractCall({
    contract,
    method: 'function approve(address to, uint256 tokenId)',
    params: [address, BigInt(tokenId)],
  });
  const { transactionHash } = await sendTransaction({
    transaction,
    account,
  });

  await waitForReceipt({
    client,
    chain,
    transactionHash,
    maxBlocksWaitTime,
  });

  return transactionHash;
};

export const setApprovedForAll = async (
  operator: Address,
  approved: boolean,
  account: Account,
) => {
  const transaction = await prepareContractCall({
    contract,
    method: 'function setApprovalForAll(address operator, bool approved)',
    params: [operator, approved],
  });
  const { transactionHash } = await sendTransaction({
    transaction,
    account,
  });

  await waitForReceipt({
    client,
    chain,
    transactionHash,
    maxBlocksWaitTime,
  });
  return transactionHash;
};

export const isApprovedForAll = async (owner: Address, operator: Address) => {
  const data = await readContract({
    contract,
    method:
      'function isApprovedForAll(address owner, address operator) view returns (bool)',
    params: [owner, operator],
  });
  return data;
};

export const releaseEscrow = async (tokenId: number, account: Account) => {
  const transaction = await prepareContractCall({
    contract,
    method: 'function releaseEscrow(uint256 tokenId) payable',
    params: [BigInt(tokenId)],
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

  const protocolFeeEvent = prepareEvent({
    signature: 'event ProtocolFee(address user, uint256 amount)',
  });

  const royaltyEvent = prepareEvent({
    signature: 'event RoyaltyPurchased(address user, uint256 amount)',
  });

  const paymentSplitEvent = prepareEvent({
    signature: 'event PaymentSplited(address user, uint256 amount)',
  });

  const escrowReleasedEvent = prepareEvent({
    signature: 'event EscrowReleased(uint256 indexed tokenId)',
  });

  const events = await parseEventLogs({
    logs: receipt.logs,
    events: [
      protocolFeeEvent,
      royaltyEvent,
      paymentSplitEvent,
      escrowReleasedEvent,
    ],
  });

  return events
    ? {
        events,
        transactionHash,
      }
    : null;
};

export const getEscrowEvents = async (transactionHash: `0x${string}`) => {
  const receipt = await waitForReceipt({
    client,
    chain,
    transactionHash,
    maxBlocksWaitTime,
  });

  const protocolFeeEvent = prepareEvent({
    signature: 'event ProtocolFee(address user, uint256 amount)',
  });

  const royaltyEvent = prepareEvent({
    signature: 'event RoyaltyPurchased(address user, uint256 amount)',
  });

  const paymentSplitEvent = prepareEvent({
    signature: 'event PaymentSplited(address user, uint256 amount)',
  });

  const escrowReleasedEvent = prepareEvent({
    signature: 'event EscrowReleased(uint256 indexed tokenId)',
  });

  const events = await parseEventLogs({
    logs: receipt.logs,
    events: [
      protocolFeeEvent,
      royaltyEvent,
      paymentSplitEvent,
      escrowReleasedEvent,
    ],
  });

  return events;
};

export const burnNFT = async (tokenId: number, account: Account) => {
  const transaction = await prepareContractCall({
    contract,
    method: 'function burn(uint256 tokenId)',
    params: [BigInt(tokenId)],
  });

  const { transactionHash } = await sendTransaction({
    transaction,
    account,
  });

  return transactionHash;
};

export const exitEscrow = async (tokenId: number, _account: Account) => {
  const transaction = await prepareContractCall({
    contract,
    method: 'function exitEscrow(uint256 tokenId)',
    params: [BigInt(tokenId)],
  });
  const { transactionHash } = await sendTransaction({
    transaction,
    account: _account,
  });

  const receipt = await waitForReceipt({
    client,
    chain,
    transactionHash,
    maxBlocksWaitTime,
  });

  const exitEscrowEvent = prepareEvent({
    signature: 'event ExitEscrow(uint256 indexed tokenId)',
  });

  const events = await parseEventLogs({
    logs: receipt.logs,
    events: [exitEscrowEvent],
  });

  return events.length > 0
    ? {
        events,
        transactionHash,
      }
    : null;
};

export const transferNFT = async (
  from: Address,
  to: Address,
  tokenId: number,
  account: Account,
) => {
  const transaction = await prepareContractCall({
    contract,
    method:
      'function safeTransferFrom(address from, address to, uint256 tokenId)',
    params: [from, to, BigInt(tokenId)],
  });
  const { transactionHash } = await sendTransaction({
    transaction,
    account,
  });

  return transactionHash;
};

export const placeBid = async (
  tokenId: number,
  duration: bigint,
  amount: bigint,
  recipient: Address,
  account: Account,
) => {
  const transaction = await prepareContractCall({
    contract,
    method:
      'function placeBid(uint256 tokenId, uint256 duration, address recipient) payable',
    params: [BigInt(tokenId), duration, recipient],
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

  // get event log
  const placeBidEvent = prepareEvent({
    signature: 'event PlaceBid(uint256 indexed tokenId, uint256 bidId)',
  });

  const events = parseEventLogs({
    logs: receipt.logs,
    events: [placeBidEvent],
  });

  let ret = null;
  if (events.length > 0)
    ret = {
      tokenId: Number(events[0].args.tokenId),
      bidId: Number(events[0].args.bidId),
      transactionHash: events[0].transactionHash,
    };

  return ret;
};

export const placeBidBeforeMint = async (
  voucher: Omit<INFTVoucher, 'signature'> & { signature: `0x${string}` },
  duration: bigint,
  amount: bigint,
  recipient: Address,
  account: Account,
) => {
  const transaction = await prepareContractCall({
    contract,
    method:
      'function placeBidBeforeMint((uint256 curationId, string tokenURI, uint256 price, address royaltyWallet, uint256 royaltyPercentage, address[] paymentWallets, uint256[] paymentPercentages, bytes signature) voucher, uint256 duration, address recipient) payable',
    params: [voucher, duration, recipient],
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

  // get event log
  const placeBidEvent = prepareEvent({
    signature: 'event PlaceBid(uint256 indexed tokenId, uint256 bidId)',
  });

  const events = parseEventLogs({
    logs: receipt.logs,
    events: [placeBidEvent],
  });

  let ret = null;
  if (events.length > 0)
    ret = {
      tokenId: Number(events[0].args.tokenId),
      bidId: Number(events[0].args.bidId),
      transactionHash: events[0].transactionHash,
    };

  return ret;
};

export const acceptBid = async (
  tokenId: number,
  bidId: number,
  account: Account,
) => {
  const transaction = await prepareContractCall({
    contract,
    method: 'function acceptBid(uint256 tokenId, uint256 bidId) payable',
    params: [BigInt(tokenId), BigInt(bidId)],
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

  const acceptBidEvent = prepareEvent({
    signature:
      'event AcceptBid(uint256 indexed tokenId, uint256 indexed bidId)',
  });

  const events = parseEventLogs({
    logs: receipt.logs,
    events: [acceptBidEvent],
  });

  let ret = null;
  if (events.length > 0)
    ret = {
      tokenId: Number(events[0].args.tokenId),
      bidId: Number(events[0].args.bidId),
      transactionHash: events[0].transactionHash,
    };

  return ret;
};

export const cancelBid = async (
  tokenId: number,
  bidId: number,
  account: Account,
) => {
  const transaction = await prepareContractCall({
    contract,
    method: 'function cancelBid(uint256 tokenId, uint256 bidId)',
    params: [BigInt(tokenId), BigInt(bidId)],
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

  const cancelBidEvent = prepareEvent({
    signature:
      'event CancelBid(uint256 indexed tokenId, uint256 indexed bidId)',
  });

  const events = parseEventLogs({
    logs: receipt.logs,
    events: [cancelBidEvent],
  });

  let ret = null;
  if (events.length > 0)
    ret = {
      tokenId: Number(events[0].args.tokenId),
      bidId: Number(events[0].args.bidId),
      transactionHash: events[0].transactionHash,
    };

  return ret;
};

export const bidDetailsByTokenId = async (tokenId: number) => {
  const data = await readContract({
    contract,
    method:
      'function getBidDetailsByTokenId(uint256 tokenId) view returns ((uint256 tokenId, address bidder, uint256 bidAmount, uint256 validUntil)[])',
    params: [BigInt(tokenId)],
  });

  return data;
};

export const isInAution = async (tokenId: number) => {
  const data = await readContract({
    contract,
    method: 'function isInAuction(uint256) view returns (bool)',
    params: [BigInt(tokenId)],
  });

  return data;
};
