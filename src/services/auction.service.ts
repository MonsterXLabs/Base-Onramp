import {
  AuctionDTO,
  AuctionDTOConverter,
  auctionDTOSchema,
  GetAuctionDTO,
} from '@/dto/auction.dto';
import { connectMongoose } from '@/modules/mongodb.module';
import Container, { Service } from 'typedi';
import { NftService } from './nft.service';
import { AuctionModel, IAuction } from '@/entities/auction.entity';
import { Types } from 'mongoose';
import {
  AucitonBidDTO,
  AuctionBidDTOConverter,
  auctionBidDTOSchema,
  createAuctionBidDTO,
  createAuctionBidDTOSchema,
  shippingAddressSchema,
} from '@/dto/auctionBid.dto';
import { AuctionBidModel } from '@/entities/auctionBid.entity';
import { UserService } from './user.service';
import { JwtUserPayload } from '@/types';
import { NftStateModel } from '@/entities/nftState.entity';
import { ISale, SaleModel, SaleStatus } from '@/entities/sale.entity';
import { INft, NftModel } from '@/entities/nft.entity';
import { BidModel } from '@/entities/bid.entity';
import { UserModel } from '@/entities/user.entity';
import { UserDTOConverter } from '@/dto/user.dto';
import { NftDTOConverter } from '@/dto/nft.dto';
import { auctionInfo, endAuction } from '@/lib/auction';
import { adminAccount } from '../lib/contract';
import { ShippingAddressModel } from '@/entities/shippingAddress';
import logger from '@/utils/logger';

const nftServices = Container.get(NftService);
const userServices = Container.get(UserService);

@Service()
export class AuctionService {
  private loadingMap: Map<number, boolean> = new Map();

  setLoading(auctionId: number, isLoading: boolean): void {
    this.loadingMap.set(auctionId, isLoading);
  }

  isLoading(auctionId: number): boolean {
    return this.loadingMap.get(auctionId) || false;
  }

  async getAuctionByQuery(query): Promise<AuctionDTO | null> {
    await connectMongoose();

    const auction = await AuctionModel.findOne(query)
      .populate({ path: 'nftId', model: NftModel })
      .populate({ path: 'bidWinnerId', model: UserModel })
      .exec();

    if (!auction) return null;

    const { nftId, bidWinnerId, ...auctionObj } = auction.toObject();

    const auctionDto = AuctionDTOConverter.convertFromEntity({
      ...auctionObj,
      nftId: new Types.ObjectId(nftId._id),
      bidWinnerId: bidWinnerId ? new Types.ObjectId(bidWinnerId._id) : '',
    });

    if (bidWinnerId)
      auctionDto.bidWinner = UserDTOConverter.convertFromEntity(bidWinnerId);
    auctionDto.nftDetail = NftDTOConverter.convertFromEntity(nftId);

    // check if auction end time is expired or not
    const { duration, auctionId, endTime } = auctionDto;
    const currentTime = new Date().getTime();
    const endAt = new Date(endTime * 1000).getTime();
    if (
      duration &&
      currentTime > endAt &&
      auctionDto.status === 'active' &&
      !this.isLoading(auctionId)
    ) {
      this.setLoading(auctionDto.auctionId, true);
      // web3 complete action
      try {
        const { events, transactionHash } = await endAuction(
          auctionId,
          adminAccount,
        );
        if (events?.[0].eventName === 'AuctionNoBids')
          await this.cancelAuction(nftId, auctionId, transactionHash);
        else if (events?.[0].eventName === 'AuctionEscrowed')
          await this.completeAuction(nftId, auctionId, transactionHash);

        this.setLoading(auctionId, false);
        return await this.getAuctionByQuery(query);
      } catch (error) {
        const err = error as Error;
        logger.error('Error in ending auction', err.message, err.stack);

        this.setLoading(auctionDto.auctionId, false);
      }
    }

    return auctionDto;
  }

  async getAuctionById(auctionId: string): Promise<AuctionDTO | null> {
    return this.getAuctionByQuery({
      _id: new Types.ObjectId(auctionId),
    });
  }

  async getAuctionDetail(nftId: string): Promise<GetAuctionDTO | null> {
    await connectMongoose();
    const auctionDto = await this.getAuctionByQuery({
      nftId: new Types.ObjectId(nftId),
    });

    if (!auctionDto) {
      return null;
    }

    const bidCount = await AuctionBidModel.aggregate([
      {
        $match: {
          nftId: new Types.ObjectId(nftId),
        },
      },
      {
        $group: {
          _id: '$auctionId',
          count: { $sum: 1 },
        },
      },
    ]);

    const winBid = await AuctionBidModel.aggregate([
      {
        $match: {
          auctionId: new Types.ObjectId(nftId),
          bidder: new Types.ObjectId(auctionDto.bidWinnerId),
        },
      },
      {
        $group: {
          _id: '$auctionId',
          sum: { $sum: '$bidValue' },
        },
      },
    ]);
    const { nftDetail, ...rest } = auctionDto;

    // check auction duration
    const currentTime = new Date().getTime();
    const auctionEndTime = new Date(auctionDto.endTime * 1000).getTime();

    if (
      currentTime > auctionEndTime &&
      auctionDto.status === 'active' &&
      !this.isLoading(auctionDto.auctionId)
    ) {
      this.setLoading(auctionDto.auctionId, true);
      // web3 complete action
      try {
        const { events, transactionHash } = await endAuction(
          auctionDto.auctionId,
          adminAccount,
        );
        if (events?.[0].eventName === 'AuctionNoBids')
          await this.cancelAuction(
            auctionDto.nftId,
            auctionDto.auctionId,
            transactionHash,
          );
        else if (events?.[0].eventName === 'AuctionEscrowed')
          await this.completeAuction(
            auctionDto.nftId,
            auctionDto.auctionId,
            transactionHash,
          );

        this.setLoading(auctionDto.auctionId, false);
      } catch (err) {
        const error = err as Error;
        logger.error(
          `Error completing Auction while fetching auction info: ${error.message}, stack: ${error.stack}`,
        );
        this.setLoading(auctionDto.auctionId, false);
      }
    }

    return {
      ...rest,
      bidCount: bidCount.length > 0 ? Number(bidCount[0].count) : 0,
      winBidAmount: winBid.length > 0 ? Number(winBid[0].sum) : 0,
    };
  }

  async auctionBidList(nftId: string): Promise<GetAuctionDTO[]> {
    await connectMongoose();
    const bids = await AuctionBidModel.find({
      nftId: new Types.ObjectId(nftId),
    })
      .populate({
        path: 'bidder',
        model: UserModel,
      })
      .sort({ createdAt: -1 })
      .exec();
    const auctionBidDTOs = bids.map((bid) => {
      const { bidder, ...rest } = bid.toObject();
      console.log(bid.toObject());
      const dto = AuctionBidDTOConverter.convertFromEntity({
        ...rest,
      });
      dto.bidderDetail = bidder;
      const getDto = AuctionBidDTOConverter.convertToGetDto(dto);
      return getDto;
    });
    return auctionBidDTOs;
  }

  async getAucitonBidQuery(query): Promise<AucitonBidDTO | null> {
    await connectMongoose();
    const auctionBid = await AuctionBidModel.findOne(query).exec();

    if (!auctionBid) return null;

    return AuctionBidDTOConverter.convertFromEntity(auctionBid);
  }

  async createAuction(
    auctionDto: AuctionDTO,
    user: JwtUserPayload,
  ): Promise<AuctionDTO | null> {
    await connectMongoose();
    auctionDTOSchema.parse(auctionDto);
    const nftDto = await nftServices.getNftById(auctionDto.nftId);

    if (nftDto === null) {
      return null;
    }

    let resultDto: AuctionDTO;

    if (auctionDto.id) {
      await AuctionModel.updateOne(
        { _id: new Types.ObjectId(auctionDto.id) },
        { $set: auctionDto },
      );
      const updatedAuction = await AuctionModel.findById(auctionDto.id).exec();
      resultDto = AuctionDTOConverter.convertFromEntity(
        updatedAuction.toObject(),
      );

      if (auctionDto.status === 'active' && auctionDto.actionHash) {
        // update nft status
        await NftModel.updateOne(
          {
            _id: new Types.ObjectId(nftDto.id),
          },
          {
            onAuction: true,
            auctionId: new Types.ObjectId(resultDto.id),
          },
        );

        // NFT states
        NftStateModel.create({
          nftId: new Types.ObjectId(nftDto.id),
          state: 'Auction Created',
          from: new Types.ObjectId(user.userId),
          actionHash: auctionDto.actionHash,
        });
      }
    } else {
      const auctionEntity = {
        ...auctionDto,
        _id: new Types.ObjectId(),
        nftId: new Types.ObjectId(auctionDto.nftId),
      } as unknown as IAuction;

      const auction = new AuctionModel(auctionEntity);
      await auction.save();

      resultDto = AuctionDTOConverter.convertFromEntity(auction.toObject());
      // update nft status
      await NftModel.updateOne(
        {
          _id: new Types.ObjectId(nftDto.id),
        },
        {
          onAuction: true,
          auctionId: new Types.ObjectId(resultDto.id),
        },
      );

      const nft: INft = await NftModel.findById(nftDto.id).exec();
      if (!nft.minted && nft.freeMinting) {
        nft.minted = true;
        nft.mintHash = auctionDto.actionHash;
        nft.mintingTime = new Date();
        nft.tokenId = auctionDto.tokenId;
        await nft.save();
      }

      // update sale status
      await SaleModel.updateOne(
        {
          _id: new Types.ObjectId(nftDto.saleId),
        },
        {
          saleStatus: SaleStatus.Auction,
        },
      );

      // NFT states
      if (auctionDto.status === 'active' && auctionDto.actionHash) {
        NftStateModel.create({
          nftId: new Types.ObjectId(nftDto.id),
          state: 'Auction Created',
          from: new Types.ObjectId(user.userId),
          actionHash: auctionDto.actionHash,
        });
      }

      // set bids cancelled
      BidModel.updateMany(
        {
          nftId: new Types.ObjectId(nftDto.id),
          bidCancelled: false,
          bidSuccess: false,
        },
        {
          $set: {
            bidCancelled: true,
          },
        },
      );
    }
    return resultDto;
  }

  async auctionBid(
    auctionBid: createAuctionBidDTO,
    user: JwtUserPayload,
  ): Promise<AucitonBidDTO | null> {
    await connectMongoose();
    createAuctionBidDTOSchema.parse(auctionBid);
    shippingAddressSchema.parse(auctionBid.bidderShippingDetail);

    // check nft and auction status
    const nftDto = await nftServices.getNftById(auctionBid.nftId);

    if (nftDto === null) {
      throw new Error('Can not find NFT in Auction Bid');
    }

    const saleEntity = await SaleModel.findOne({
      _id: new Types.ObjectId(nftDto.saleId),
    }).exec();

    const sale: ISale = saleEntity.toObject();
    // check bidder
    const bidder = await userServices.getUserById(auctionBid.bidder);
    if (bidder === null) {
      throw new Error(' Can not find Bidder in Auction Bid');
    }

    // check auction
    const auctionDto = await this.getAuctionByQuery({
      auctionId: auctionBid.auctionId,
      status: 'active',
    });
    if (auctionDto === null) {
      throw new Error('Can not find Auciont in Auction Bid');
    }

    // save shipping Address
    const shippingAddress = await ShippingAddressModel.create({
      ...auctionBid.bidderShippingDetail,
      nftId: new Types.ObjectId(auctionBid.nftId),
    });
    const shippingAddressId = shippingAddress._id;

    // place bid
    const bidEntity = AuctionBidDTOConverter.convertFromDto({
      ...auctionBid,
      auctionId: auctionDto.id,
      bidderShippingId: shippingAddressId,
    });
    const bid = new AuctionBidModel(bidEntity);
    await bid.save();
    const resultDto = AuctionBidDTOConverter.convertFromEntity(bid.toObject());
    // auction upate
    const [, , , highBidAmount] = await auctionInfo(auctionDto.auctionId);
    await AuctionModel.updateOne(
      {
        _id: new Types.ObjectId(auctionDto.id),
      },
      {
        bidWinnerId: new Types.ObjectId(user.userId),
        highBidAmount: Number(highBidAmount),
      },
    );

    // create nft state
    await NftStateModel.create({
      nftId: new Types.ObjectId(auctionBid.nftId),
      state: 'Auction Bid Placed',
      from: new Types.ObjectId(user.userId),
      to: sale.sellerShippingId,
      actionHash: auctionBid.bidHash,
      price: auctionBid.bidValue,
      currency: 'WEI',
    });

    return resultDto;
  }

  async cancelAuction(
    nftId: string,
    auctionId: number,
    actionHash: string,
  ): Promise<Boolean> {
    await connectMongoose();

    const nftDto = await nftServices.getNftById(nftId);

    if (nftDto === null) throw new Error('NFT not existed in cancel auction');

    const auction = await AuctionModel.findOne({
      nftId: new Types.ObjectId(nftId),
      auctionId,
    }).exec();

    const auctionDto = AuctionDTOConverter.convertFromEntity(
      auction.toObject(),
    );
    if (!auction) throw new Error('Auction not existed in cancel auction');

    // update Auction and NFT status
    AuctionModel.updateOne(
      {
        _id: new Types.ObjectId(auctionDto.id),
      },
      {
        status: 'cancelled',
      },
    );

    NftModel.updateOne(
      {
        _id: new Types.ObjectId(nftId),
      },
      {
        onAuction: false,
      },
    );

    await SaleModel.updateOne(
      {
        _id: nftDto.saleId,
      },
      {
        saleStatus: SaleStatus.NotForSale,
      },
    );

    NftStateModel.create({
      nftId: new Types.ObjectId(nftDto.id),
      state: 'Auction Cancelled',
      from: nftDto.owner,
      actionHash: actionHash,
    });

    return true;
  }

  async completeAuction(nftId: string, auctionId: number, actionHash: string) {
    await connectMongoose();

    const nftDto = await nftServices.getNftById(nftId);

    if (nftDto === null)
      throw new Error('NFT not existed in completing auction');

    const auction = await AuctionModel.findOne({
      nftId: new Types.ObjectId(nftId),
      auctionId,
    }).exec();

    const auctionDto = AuctionDTOConverter.convertFromEntity(
      auction.toObject(),
    );
    if (!auction) throw new Error('Auction not existed in completing auction');

    const auctionBid = await this.getAucitonBidQuery({
      nftId: new Types.ObjectId(nftId),
      auctionId: new Types.ObjectId(auctionDto.id),
      bidId: auctionDto.highBid,
    });

    if (!auctionBid)
      throw new Error('Highest auction not existed in completing auction');

    // update Auction and NFT status
    AuctionModel.updateOne(
      {
        _id: new Types.ObjectId(auctionDto.id),
      },
      {
        status: 'completed',
      },
    );

    await SaleModel.updateOne(
      {
        _id: nftDto.saleId,
      },
      {
        ItemPUrchasedTxnHash: actionHash,
        ItemPurchasedOn: new Date(),
        saleWinner: auctionDto.bidWinnerId,
        active: true,
        buyerShippingId: new Types.ObjectId(auctionBid.bidderShippingId),
        saleStatus: SaleStatus.Ordered,
      },
    );

    NftStateModel.create({
      nftId: new Types.ObjectId(nftDto.id),
      state: 'Auction Completed',
      from: nftDto.owner,
      actionHash: actionHash,
    });

    return true;
  }

  async releaseAuction(
    nftId: string,
    auctionId: number,
    auctionHash: string,
    user: JwtUserPayload,
  ) {
    await connectMongoose();

    const nftDto = await nftServices.getNftById(nftId);

    if (nftDto === null)
      throw new Error('NFT not existed in releasing auction');

    const auction = await AuctionModel.findOne({
      nftId: new Types.ObjectId(nftId),
      auctionId,
      status: 'completed',
    }).exec();

    const auctionDto = AuctionDTOConverter.convertFromEntity(
      auction.toObject(),
    );
    if (!auction) throw new Error('Auction not existed in releasing auction');

    // complete auction
    await this.completeAuction(nftId, auctionId, auctionHash);
  }
}
