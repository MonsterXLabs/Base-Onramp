// FILE: pages/api/users/[id].ts

import { NftService } from '@/services/nft.service';
import { NextApiRequest, NextApiResponse } from 'next';
import Container from 'typedi';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { id } = req.query;
  const nftService = Container.get(NftService); // Inject service
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing user ID' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await nftService.getNftById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      error: 'Failed to fetch user',
      errorDetails: err.message,
      stack: err.stack,
    });
  }
}
