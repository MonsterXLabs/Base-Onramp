import { CancelAuctionDTO } from '@/dto/auction.dto';
import { AuctionService } from '@/services/auction.service';
import { NextApiRequest, NextApiResponse } from 'next';
import Container from 'typedi';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const auctionService = Container.get(AuctionService);

  if (req.method === 'POST') {
    const { nftId, auctionId, actionHash }: CancelAuctionDTO = req.body;
    await auctionService.cancelAuction(nftId, auctionId, actionHash);
    res
      .status(200)
      .json({ message: 'Auction cancelled successfully', status: true });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
