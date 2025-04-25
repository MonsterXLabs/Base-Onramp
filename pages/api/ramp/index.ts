import { NextApiRequest, NextApiResponse } from 'next';
import { Container } from 'typedi';
import { RampService } from '@/services/ramp.service';
import { RampDTO, rampDtoSchema } from '@/dto/ramp.dto';
import logger from '@/utils/logger';
import { ErrorResponse } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ErrorResponse | RampDTO>,
) {
  const rampService = Container.get(RampService);

  if (req.method === 'POST') {
    try {
      const rampDto: RampDTO = req.body;
      const ramp = await rampService.getRampByQuery({
        nftId: rampDto.nftId,
        buyerWallet: rampDto.buyerWallet,
      });

      let result;
      if (ramp && ramp.id) {
        result = await rampService.updateRamp(ramp.id, rampDto);
      } else {
        result = await rampService.createRamp(rampDto);
      }
      res.status(201).json(result);
    } catch (error) {
      const err = error as Error;
      logger.error(`Error creating Ramp: ${err.message}, ${err.stack}`);
      res.status(500).json({ error: 'Failed to create Ramp' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
