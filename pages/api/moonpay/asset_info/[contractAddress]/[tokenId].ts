import { AssetInfoConverter, AssetInfoDTO } from '@/dto/moonpay/AssetInfo.dto';
import { NftDTO } from '@/dto/nft.dto';
import { contract } from '@/lib/contract';
import { tokenDetail } from '@/lib/helper';
import { NftService } from '@/services/nft.service';
import { ErrorResponse, TokenStatusEnum } from '@/types';
import logger from '@/utils/logger';
import { NextApiRequest, NextApiResponse } from 'next';
import Container from 'typedi';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AssetInfoDTO | ErrorResponse>,
) {
  const { contractAddress, tokenId } = req.query;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  logger.info(
    `Fetching asset info for contractAddress: ${contractAddress}, tokenId: ${tokenId}, URL: ${req.url}, IP: ${ip}`,
  );
  const nftServices = Container.get(NftService);

  if (!contractAddress || !tokenId) {
    return res
      .status(400)
      .json({ error: 'Missing contractAddress or tokenId' });
  }

  // check contract address
  if (
    contractAddress.toLocaleString().toLowerCase() !==
    contract?.address.toLowerCase()
  ) {
    return res.status(404).json({ error: 'Contract not found' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const nftDto: NftDTO = await nftServices.getNftById(tokenId as string);
    // check token status
    const web3TokenId = nftDto?.tokenId;

    if (!web3TokenId) {
      // free minting
    } else {
      const { status } = await tokenDetail(BigInt(web3TokenId));
      if (status === TokenStatusEnum.Escrowed) {
        return res.status(404).json({ error: 'Token in escrow' });
      }
    }

    const assetInfo = await AssetInfoConverter.convertFromNftDTO(nftDto);
    res.status(200).json(assetInfo);
  } catch (error) {
    const err = error as Error;
    logger.error(
      `Failed to fetch asset info: ${err.message}, stack: ${err.stack}`,
    );
    res.status(500).json({ error: 'Failed to fetch asset info' });
  }
}
