import { Types } from 'mongoose';
import { Service } from 'typedi';
import {
  MoonpayTransactionModel,
  IMoonpayTransaction,
} from '@/entities/moonpayTransaction.entity';
import {
  MoonpayTransactionDTO,
  moonpayTransactionDtoSchema,
  TransactionStatusResponse,
} from '@/dto/moonpay/moonpayTransaction.dto';
import { connectMongoose } from '@/modules/mongodb.module';
import { NftDTO } from '@/dto/nft.dto';
import {
  getTokenAmount,
  purchaseAsset,
  purchaseAssetBeforeMint,
} from '@/lib/helper';
import { Address, checksumAddress } from 'thirdweb/utils';
import { formatEther } from 'viem';
import { authenticationServices } from './legacy/supplier';
import { adminAccount } from '@/lib/contract';
import { RampDTO } from '@/dto/ramp.dto';
import axios from 'axios';
import { INFTVoucher } from '@/types';

const legacy_server_uri = process.env.NEXT_PUBLIC_APP_BACKEND_URL;

@Service()
export class MoonpayTransactionService {
  async createTransaction(
    transactionDto: MoonpayTransactionDTO,
  ): Promise<MoonpayTransactionDTO> {
    await connectMongoose();
    // Validate entity
    moonpayTransactionDtoSchema.parse(transactionDto);

    const transactionEntity: IMoonpayTransaction = {
      ...transactionDto,
      _id: new Types.ObjectId(),
      listingId: transactionDto?.listingId
        ? new Types.ObjectId(transactionDto?.listingId)
        : null,
    } as IMoonpayTransaction;

    // Insert entity into the database
    const transaction = new MoonpayTransactionModel(transactionEntity);
    await transaction.save();

    // Convert entity back to DTO
    return MoonpayTransactionDTO.convertFromEntity(transaction.toObject());
  }

  async getTransactionByQuery(
    query: Record<string, any>,
  ): Promise<MoonpayTransactionDTO | null> {
    await connectMongoose();
    const transaction = await MoonpayTransactionModel.findOne(query).exec();

    if (!transaction) {
      return null;
    }

    // Convert entity to DTO
    return MoonpayTransactionDTO.convertFromEntity(transaction.toObject());
  }

  async updateTransaction(
    id: string,
    transactionDto: Partial<MoonpayTransactionDTO>,
  ): Promise<MoonpayTransactionDTO | null> {
    await connectMongoose();
    const updateData: Partial<IMoonpayTransaction> =
      MoonpayTransactionDTO.convertToEntity(transactionDto);

    // Validate update data
    moonpayTransactionDtoSchema.partial().parse(updateData);

    const transaction = await MoonpayTransactionModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true },
    ).exec();

    if (!transaction) {
      return null;
    }

    // Convert entity to DTO
    return MoonpayTransactionDTO.convertFromEntity(transaction.toObject());
  }

  // legacy server apis
  async buyItem(data: any, token: string) {
    return await axios.post(`${legacy_server_uri}/sale/buyNft`, data, {
      headers: {
        authorization: 'Bearer ' + token,
      },
    });
  }

  async mintAndSale(data: any, token: string) {
    return await axios.post(`${legacy_server_uri}/nft/mint-and-sale`, data, {
      headers: {
        authorization: 'Bearer ' + token,
      },
    });
  }
  async deliverNft(
    nftDto: NftDTO,
    transaction: MoonpayTransactionDTO,
    rampDto: RampDTO,
  ) {
    if (!transaction?.id || !transaction.buyerWalletAddress || !rampDto?.id)
      throw new Error('Moonpay transaction does not exist.');
    await connectMongoose();
    try {
      const tokenAmount = await getTokenAmount(nftDto.price.toString(), 'Wei');

      //get token
      const address = checksumAddress(
        transaction.buyerWalletAddress as `0x${string}`,
      ) as Address;
      const {
        data: { token },
      } = await authenticationServices.connectWallet({
        wallet: address as Address,
      });

      // web3 logic
      if (nftDto?.minted) {
        const { transactionHash } = await purchaseAsset(
          BigInt(nftDto?.tokenId),
          tokenAmount as bigint,
          transaction.buyerWalletAddress as Address,
          adminAccount,
        );

        const data = {
          nftId: nftDto.id,
          name: rampDto.name,
          email: rampDto.email,
          country: rampDto.country,
          address: rampDto.address,
          phoneNumber: rampDto.phoneNumber,
          contactInformation: rampDto?.contactInformation ?? '',
          concent: rampDto?.concent ?? '',
          buyHash: transactionHash,
          lastPrice: Number(tokenAmount),
        };

        await this.buyItem(data, token);

        await this.updateTransaction(transaction.id, {
          status: 'completed',
          transactionHash: [transactionHash],
          tokenId: [Number(nftDto.tokenId).toString()],
        });
      } else {
        const voucher: INFTVoucher = JSON.parse(
          nftDto.voucher,
          (key, value) => {
            // Check if the value is a number and can be safely converted to BigInt
            if (typeof value === 'number') {
              return BigInt(value);
            }
            return value;
          },
        );

        const usdAmount: string = formatEther(voucher.price);
        const tokenAmount = await getTokenAmount(usdAmount, 'Wei');

        const { tokenId, transactionHash } = await purchaseAssetBeforeMint(
          voucher as Omit<INFTVoucher, 'signature'> & {
            signature: `0x${string}`;
          },
          tokenAmount as bigint,
          transaction.buyerWalletAddress as Address,
          adminAccount,
        );

        await this.mintAndSale(
          {
            nftId: nftDto.id,
            mintHash: transactionHash,
            tokenId: Number(tokenId),
          },
          token,
        );

        const data = {
          nftId: nftDto.id,
          name: rampDto.name,
          email: rampDto.email,
          country: rampDto.country,
          address: rampDto.address,
          phoneNumber: rampDto.phoneNumber,
          contactInformation: rampDto?.contactInformation ?? '',
          concent: rampDto?.concent ?? '',
          buyHash: transactionHash,
          lastPrice: Number(tokenAmount),
        };

        await this.buyItem(data, token);

        await this.updateTransaction(transaction.id, {
          status: 'completed',
          transactionHash: [transactionHash],
          tokenId: [Number(tokenId).toString()],
        });
      }
    } catch (err) {
      console.log(err);
      // update transaction status
      await this.updateTransaction(transaction.id, {
        status: 'failed',
      });
      throw err;
    }
  }

  async transactionStatus(
    transactionIds: string,
  ): Promise<TransactionStatusResponse[]> {
    const ids = transactionIds.split(',');
    await connectMongoose();
    const transactions = await MoonpayTransactionModel.find({
      _id: { $in: ids.map((id) => new Types.ObjectId(id)) },
    }).exec();
    const results = transactions.map((entity) => {
      const dto = MoonpayTransactionDTO.convertFromEntity(entity.toObject());
      return MoonpayTransactionDTO.convertToStatusResponse(dto);
    });

    return results;
  }
}
