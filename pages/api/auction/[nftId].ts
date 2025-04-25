import { AuctionDTO } from '@/dto/auction.dto';
import { AuctionService } from '@/services/auction.service';
import { ErrorResponse } from '@/types';
import { NextApiRequest, NextApiResponse } from 'next';
import Container from 'typedi';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ErrorResponse | AuctionDTO | null>,
) {
  const auctionService = Container.get(AuctionService);
  if (req.method === 'GET') {
    // Process a POST request
    const { nftId } = req.query;

    const auctiondto = await auctionService.getAuctionDetail(nftId as string);

    res.status(200).json(auctiondto);
  } else {
    // Handle any other HTTP method
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
