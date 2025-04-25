import { MoonpayTransactionDTO } from '@/dto/moonpay/moonpayTransaction.dto';
import { NftDTO } from '@/dto/nft.dto';
import { RampDTO } from '@/dto/ramp.dto';
import { tokenDetail } from '@/lib/helper';
import { MoonpayTransactionService } from '@/services/moonpay.service';
import { NftService } from '@/services/nft.service';
import { RampService } from '@/services/ramp.service';
import { ErrorResponse, TokenStatusEnum } from '@/types';
import logger from '@/utils/logger';
import { NextApiRequest, NextApiResponse } from 'next';
import { checksumAddress } from 'thirdweb/utils';
import Container from 'typedi';

interface DeliverNftResponse {
  transactionId: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ErrorResponse | DeliverNftResponse>,
) {
  if (req.method === 'POST') {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    logger.info(
      `URL: ${req.url}, body: ${JSON.stringify(req.body)}, ip: ${ip}`,
    );
    const { contractAddress, tokenId } = req.query;
    const nftServices = Container.get(NftService);
    const moonpayServices = Container.get(MoonpayTransactionService);
    const rampServices = Container.get(RampService);

    const {
      mode,
      buyerWalletAddress,
      priceCurrencyCode,
      price,
      quantity,
      sellerWalletAddress,
    } = req.body as {
      mode: string;
      buyerWalletAddress: string;
      priceCurrencyCode: string;
      price: number;
      quantity: number;
      sellerWalletAddress: string;
    };

    if (
      !mode ||
      !buyerWalletAddress ||
      !priceCurrencyCode ||
      !price ||
      !quantity
    ) {
      return res.status(404).json({ error: 'Missing required parameters' });
    }
    if (!contractAddress || !tokenId) {
      return res.status(404).json({ error: 'Missing required parameters' });
    }

    try {
      const nftDto: NftDTO = await nftServices.getNftById(tokenId as string);
      const rampDto: RampDTO = await rampServices.getRampByQuery({
        nftId: tokenId as string,
        buyerWallet: checksumAddress(buyerWalletAddress) as string,
      } as Partial<RampDTO>);

      if (!rampDto) {
        return res
          .status(404)
          .json({ error: 'Ramp information does not exist' });
      }

      // check pending transaction
      const pendingTransaction = await moonpayServices.getTransactionByQuery({
        listingId: tokenId as string,
        buyerWalletAddress: checksumAddress(buyerWalletAddress),
        status: 'pending',
      });

      if (pendingTransaction) {
        return res
          .status(403)
          .json({ error: 'Pending transaction already exists for this token' });
      }

      // create transaction
      let transaction = await moonpayServices.createTransaction({
        mode,
        buyerWalletAddress: checksumAddress(buyerWalletAddress),
        priceCurrencyCode,
        price: Number(price),
        quantity,
        sellerWalletAddress,
        listingId: tokenId as string,
        status: 'pending',
      });

      // check token status
      const web3TokenId = nftDto?.tokenId;

      if (!web3TokenId || nftDto?.freeMinting) {
        // free minting
      } else {
        const { status } = await tokenDetail(BigInt(web3TokenId));
        if (status === TokenStatusEnum.Escrowed) {
          return res.status(403).json({ error: 'Token in escrow' });
        }
      }

      // Process deliverNft in the background
      moonpayServices
        .deliverNft(nftDto, transaction, rampDto)
        .then((result) => {
          console.log(result);
        })
        .catch((error) => {
          logger.error(
            `Failed to deliver NFT: ${error.message}, stack: ${error.stack}`,
          );
        });

      res.status(200).json({ transactionId: transaction?.id });
    } catch (error) {
      const err = error as Error;
      logger.error(
        `Failed to fetch asset info: ${err.message}, stack: ${err.stack}`,
      );
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
