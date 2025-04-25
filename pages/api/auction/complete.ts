import { CompleteAuctionDTO } from '@/dto/auction.dto';
import { AuctionService } from '@/services/auction.service';
import { NextApiRequest, NextApiResponse } from 'next';
import Container from 'typedi';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const auctionService = Container.get(AuctionService);

  if (req.method === 'POST') {
    try {
      const { nftId, auctionId, actionHash }: CompleteAuctionDTO = req.body;
      await auctionService.completeAuction(nftId, auctionId, actionHash);
      res
        .status(200)
        .json({ message: 'Auction completed successfully', status: true });
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
