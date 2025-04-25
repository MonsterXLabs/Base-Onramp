import * as dotenv from 'dotenv';
dotenv.config();
import Container from 'typedi';
import 'reflect-metadata';
import { AuctionService } from './auction.service';
import { adminAccount } from '@/lib/contract';
import { jamesAccount, monsterDevAccount } from '@/lib/account';
import {
  userServices as legacyUserService,
  authenticationServices as legacyAuthService,
} from './legacy/supplier';
import { Address } from 'thirdweb';
import axios from 'axios';
import { connectMongoose } from '@/modules/mongodb.module';
import { INft, NftModel } from '@/entities/nft.entity';
import { ISale, SaleModel, SaleStatus } from '@/entities/sale.entity';
import {
  burnNFT,
  exitEscrow,
  getVoucherSignature,
  isInAution,
  listAsset,
  tokenDetail,
  unlistAsset,
} from '@/lib/helper';
import { parseEther } from 'viem';
import { INFTVoucher, JwtUserPayload, PaymentSplitType } from '@/types';
import {
  bidAuction,
  cancelAuction,
  createAuction,
  createFreeMintAuction,
  endAuction,
} from '@/lib/auction';
import { AuctionDTO } from '@/dto/auction.dto';
import { AuctionModel, IAuction } from '@/entities/auction.entity';
import {
  AucitonBidDTO,
  createAuctionBidDTO,
  ShippingAddressDTO,
} from '@/dto/auctionBid.dto';

// Get the service instance
const auctionService = Container.get(AuctionService);

// test addresses
export const test_james_address: ShippingAddressDTO = {
  name: 'James',
  email: 'james@dev.com',
  country: 'US',
  address: {
    line1: '123 Main St',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
  },
  phoneNumber: '1234567890',
  contactInformation: 'Email',
};

export const test_monsterDev_address: ShippingAddressDTO = {
  name: 'monsterDev',
  email: 'monsterDev@test.com',
  country: 'US',
  address: {
    line1: '123 Main St',
    city: 'Washington DC',
    state: 'DC',
    postalCode: '20001',
  },
  phoneNumber: '1231231230',
  contactInformation: 'Email',
};

// get monsterDev and James address
export async function test_show_address() {
  const {
    data: { user: monsterDev, token: monsterDevToken },
  } = await legacyAuthService.connectWallet({
    wallet: monsterDevAccount.address as Address,
  });
  const {
    data: { user: james, token: jamesToken },
  } = await legacyAuthService.connectWallet({
    wallet: jamesAccount.address as Address,
  });

  return { monsterDev, james, monsterDevToken, jamesToken };
}

// create NFT
export async function test_create_nft() {
  const { monsterDev, monsterDevToken: token } = await test_show_address();
  const originId = '678ba935495fc6bb05298ba4'; // mintBy monsterDev
  await connectMongoose();
  const nft: INft = await NftModel.findById(originId);
  // mint a new NFT
  const { _id, ...nftObj } = nft.toObject<INft>();

  const voucher: INFTVoucher = JSON.parse(nft.voucher, (key, value) => {
    // Check if the value is a number and can be safely converted to BigInt
    if (typeof value === 'number') {
      return BigInt(value);
    }
    return value;
  });

  const price = parseEther(String(nft.price));
  const paymentSplits: PaymentSplitType[] = voucher.paymentWallets.map(
    (wallet, index) => ({
      paymentWallet: wallet,
      paymentPercentage: voucher.paymentPercentages[index],
    }),
  );

  const { transactionHash, tokenId } = await listAsset({
    curationId: Number(voucher.curationId),
    tokenURI: nft.jsonHash,
    price,
    royaltyWallet: voucher.royaltyWallet,
    royaltyPercentage: voucher.royaltyPercentage,
    paymentSplits,
    account: monsterDevAccount,
  });
  console.log('mintHash', transactionHash);

  nftObj.owner = monsterDev._id;
  nftObj.mintedBy = monsterDev._id;
  nftObj.mintHash = transactionHash;
  nftObj.tokenId = Number(tokenId);
  nftObj.minted = true;
  const newNft: INft = await NftModel.create(nftObj);

  const sale: ISale = await SaleModel.findById(nft.saleId);
  // create a new sale
  const newSale = await SaleModel.create({
    nftId: newNft._id,
    sellerId: monsterDev._id,
    saleStartOn: new Date(),
    saleStatus: SaleStatus.Active,
    active: true,
    saleStartTxnHash: transactionHash,
    sellerShippingId: sale.sellerShippingId,
  });
  newNft.onSale = true;
  newNft.saleId = newSale._id;
  newNft.save();
  return newNft;
}

// create free mint NFT
export async function test_create_free_mint_nft() {
  const { monsterDev, monsterDevToken: token } = await test_show_address();
  const originId = '678ba935495fc6bb05298ba4'; // mintBy monsterDev
  await connectMongoose();
  const nft: INft = await NftModel.findById(originId);
  // mint a new NFT
  const { _id, ...nftObj } = nft.toObject<INft>();

  const voucher: INFTVoucher = JSON.parse(nft.voucher, (key, value) => {
    // Check if the value is a number and can be safely converted to BigInt
    if (typeof value === 'number') {
      return BigInt(value);
    }
    return value;
  });

  const tokenUrl = voucher.tokenURI + `_${Date.now()}`;
  voucher.tokenURI = tokenUrl;
  const signature = await getVoucherSignature(voucher, monsterDevAccount);
  const newVoucher = { ...voucher, signature: `0x${signature}` };
  const voucherString = JSON.stringify(
    { ...voucher, signature },
    (key, value) => (typeof value === 'bigint' ? Number(value) : value),
  );

  nftObj.owner = monsterDev._id;
  nftObj.mintedBy = monsterDev._id;
  nftObj.tokenId = null;
  nftObj.minted = false;
  nftObj.voucher = voucherString;
  const newNft: INft = await NftModel.create(nftObj);

  const sale: ISale = await SaleModel.findById(nft.saleId);
  // create a new sale
  const newSale = await SaleModel.create({
    nftId: newNft._id,
    sellerId: monsterDev._id,
    saleStartOn: new Date(),
    saleStatus: SaleStatus.Active,
    active: true,
    sellerShippingId: sale.sellerShippingId,
  });
  newNft.onSale = true;
  newNft.saleId = newSale._id;
  newNft.save();
  return newNft;
}

// burn NFT
export async function test_burn_nft(nftId: string) {
  await connectMongoose();
  await new Promise((resolve) => setTimeout(resolve, 5000));
  const nft: INft = await NftModel.findById(nftId);
  await SaleModel.updateOne(
    { nftId: nft._id, active: true },
    { saleStatus: SaleStatus.Cancelled, active: false },
  );

  await NftModel.deleteOne({ _id: nft._id });

  if (!nft.tokenId) return;

  const tokenInfo = await tokenDetail(BigInt(nft.tokenId));
  // get owner
  const ownerAccount = monsterDevAccount;

  console.log(
    'burn requested token info',
    nft.tokenId,
    tokenInfo,
    ownerAccount.address,
  );

  if (tokenInfo.status === 1) {
    // unlist the asset
    await unlistAsset(tokenInfo.tokenId, ownerAccount);
    await new Promise((resolve) => setTimeout(resolve, 5000));
    await burnNFT(tokenInfo.tokenId, ownerAccount);
  } else if (tokenInfo.status === 2) {
    await exitEscrow(tokenInfo.tokenId, adminAccount);
    await new Promise((resolve) => setTimeout(resolve, 5000));
    await burnNFT(tokenInfo.tokenId, ownerAccount);
  } else {
    const isAuction = await isInAution(tokenInfo.tokenId);
    if (isAuction) {
      const auction: IAuction = await AuctionModel.findOne({
        nftId: nftId,
        status: 'active',
      });
      if (auction.endTime * 1000 > Date.now()) {
        await cancelAuction(auction.auctionId, ownerAccount);
        await new Promise((resolve) => setTimeout(resolve, 5000));
      } else {
        await endAuction(auction.auctionId, adminAccount);
        await new Promise((resolve) => setTimeout(resolve, 5000));
        await exitEscrow(tokenInfo.tokenId, adminAccount);
        await new Promise((resolve) => setTimeout(resolve, 5000));
        await burnNFT(tokenInfo.tokenId, ownerAccount);
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
    await burnNFT(tokenInfo.tokenId, ownerAccount);
  }
  console.log('burnt NFT');
}

// create auction
export async function test_create_auction() {
  const { monsterDev } = await test_show_address();
  // create NFT
  const nft: INft = await test_create_nft();

  // create auction
  const minBid = parseEther('0.00001');
  const duration = 60 * 60 * 24; // 1 day
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const { transactionHash, endTime, auctionId } = await createAuction(
    BigInt(nft.tokenId),
    minBid,
    BigInt(duration),
    monsterDevAccount,
  );
  const auctionDto: AuctionDTO = {
    status: 'active',
    nftId: nft._id.toHexString(),
    minBid: Number(minBid),
    duration: Number(duration),
    auctionId: Number(auctionId),
    actionHash: transactionHash,
    endTime: Number(endTime),
  };

  const user: JwtUserPayload = {
    userId: monsterDev._id,
    wallet: monsterDev.wallet,
    iad: 1000,
    exp: 10000,
  };

  const newAuction = await auctionService.createAuction(auctionDto, user);
  console.log('creae auction', newAuction);
  return newAuction;
}

// create free mint auction
export async function test_create_free_mint_auction() {
  const { monsterDev } = await test_show_address();
  // create Free mint NFT
  const nft: INft = await test_create_free_mint_nft();

  const voucher: INFTVoucher = JSON.parse(nft.voucher, (key, value) => {
    // Check if the value is a number and can be safely converted to BigInt
    if (typeof value === 'number') {
      return BigInt(value);
    }
    return value;
  });

  // create acution
  const duration = 60 * 60 * 24; // 1 day
  const minBid = parseEther('0.00001');

  // create Free mint auction
  const { transactionHash, endTime, auctionId, tokenId } =
    await createFreeMintAuction(
      voucher as Omit<INFTVoucher, 'signature'> & {
        signature: `0x${string}`;
      },
      BigInt(minBid),
      BigInt(duration),
      monsterDevAccount,
    );

  const auctionDto: AuctionDTO = {
    status: 'active',
    nftId: nft._id.toHexString(),
    minBid: Number(minBid),
    duration: Number(duration),
    auctionId: Number(auctionId),
    actionHash: transactionHash,
    endTime: Number(endTime),
    tokenId: Number(tokenId),
  };

  const user: JwtUserPayload = {
    userId: monsterDev._id,
    wallet: monsterDev.wallet,
    iad: 1000,
    exp: 10000,
  };

  const newAuction = await auctionService.createAuction(auctionDto, user);
  console.log('free mint auction created');
  return newAuction;
}

export async function test_auction_bid() {
  const { monsterDev, james } = await test_show_address();
  // create Auction
  const auction: AuctionDTO = await test_create_auction();
  // get Auction
  // const auction: AuctionDTO = await auctionService.getAuctionByQuery({
  //   auctionId: 15,
  //   status: 'active',
  // });
  // bid on auction
  const tokenAmount = parseEther('0.00001');
  const { transactionHash } = await bidAuction(
    auction.auctionId,
    tokenAmount,
    jamesAccount,
  );
  console.log('bid on auction', transactionHash);
  const auctionBid: createAuctionBidDTO = {
    nftId: auction.nftId,
    auctionId: auction.auctionId,
    bidValue: Number(tokenAmount),
    bidder: james._id,
    bidHash: transactionHash,
    bidderShippingDetail: test_james_address,
  };

  const jamesPayload: JwtUserPayload = {
    userId: james._id,
    wallet: james.wallet,
    iad: 1000,
    exp: 10000,
  };
  const auctionBidDto = await auctionService.auctionBid(
    auctionBid,
    jamesPayload,
  );
  console.log(auctionBidDto);
}
export async function test_free_mint_auction_bid() {
  const { monsterDev, james } = await test_show_address();
  await connectMongoose();
  // create auction
  const auctionDto: AuctionDTO = await test_create_free_mint_auction();

  const nft: INft = await NftModel.findById(auctionDto.nftId);
  const voucher: INFTVoucher = JSON.parse(nft.voucher, (key, value) => {
    // Check if the value is a number and can be safely converted to BigInt
    if (typeof value === 'number') {
      return BigInt(value);
    }
    return value;
  });

  // bid auction
  const tokenAmount = parseEther('0.00001');
  const { transactionHash } = await bidAuction(
    Number(auctionDto.auctionId),
    tokenAmount,
    jamesAccount,
  );

  const auctionBid: createAuctionBidDTO = {
    nftId: auctionDto.nftId,
    auctionId: auctionDto.auctionId,
    bidValue: Number(tokenAmount),
    bidder: james._id,
    bidHash: transactionHash,
    bidderShippingDetail: test_james_address,
  };

  const jamesPayload: JwtUserPayload = {
    userId: james._id,
    wallet: james.wallet,
    iad: 1000,
    exp: 10000,
  };
  const auctionBidDto = await auctionService.auctionBid(
    auctionBid,
    jamesPayload,
  );
  console.log(auctionBidDto);
}
export async function test_cancel_auction() {}

(async () => {
  try {
    // await test_auction_bid();
    await test_free_mint_auction_bid();
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Ensure the process exits after the function completes
    process.exit();
  }
})();
