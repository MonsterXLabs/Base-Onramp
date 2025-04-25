import { AuctionDTO } from '@/dto/auction.dto';
import { AuctionService } from '@/services/auction.service';
import { ErrorResponse, JwtUserPayload } from '@/types';
import { NextApiRequest, NextApiResponse } from 'next';
import Container from 'typedi';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ErrorResponse | AuctionDTO>,
) {
  const auctionService = Container.get(AuctionService);

  if (req.method === 'POST') {
    const auctionDto: AuctionDTO = req.body;
    try {
      const user: JwtUserPayload = JSON.parse(
        req.headers['x-jwt-payload'] as string,
      );
      const result = await auctionService.createAuction(auctionDto, user);

      return res.status(201).json(result);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
