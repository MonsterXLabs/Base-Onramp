import { z } from 'zod';
import { NftDTO } from '../nft.dto';
import { adminWalletAddress, contract } from '@/lib/contract';
import { getTokenAmount } from '@/lib/helper';

export const AssetInfoSchema = z.object({
  tokenId: z.string(),
  contractAddress: z.string(),
  name: z.string(),
  collection: z.string(),
  imageUrl: z.string().url(),
  exploreUrl: z.string().url(),
  price: z.number(),
  priceCurrencyCode: z.string(),
  quantity: z.number(),
  sellerAddress: z.string(),
  sellType: z.string(),
  flow: z.string(),
  network: z.string(),
});

export type AssetInfoDTO = z.infer<typeof AssetInfoSchema>;

export const AssetInfoConverter = {
  async convertFromNftDTO(nftDto: NftDTO): Promise<Partial<AssetInfoDTO>> {
    const ethPrice = (await getTokenAmount(
      nftDto?.price.toString() ?? '0',
    )) as string;

    return {
      tokenId: nftDto.id,
      contractAddress: contract?.address || '',
      name: nftDto.name,
      collection: nftDto.curationInfo?.name,
      imageUrl: nftDto.cloudinaryUrl,
      exploreUrl: `https://sepolia.basescan.org/nft/${contract?.address}/${nftDto.tokenId}`,
      price: Number(ethPrice) || 0,
      priceCurrencyCode: 'eth_base',
      quantity: 1,
      sellerAddress: adminWalletAddress,
      sellType: 'Primary',
      flow: 'Lite',
      network: 'base',
    };
  },
};
