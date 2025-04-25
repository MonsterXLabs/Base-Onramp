import { GetAuctionDTO } from '@/dto/auction.dto';
import { AuctionService } from '@/services/auction.service';
import { ErrorResponse } from '@/types';
import { NextApiRequest, NextApiResponse } from 'next';
import Container from 'typedi';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ErrorResponse | GetAuctionDTO[]>,
) {
  const auctionService = Container.get(AuctionService);

  if (req.method === 'POST') {
    // Process a POST request
    const { nftId } = req.body;

    const bidList = await auctionService.auctionBidList(nftId as string);
    res.status(200).json(bidList);
  } else {
    // Handle any other HTTP method
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
