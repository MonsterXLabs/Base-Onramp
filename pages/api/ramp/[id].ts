import { NextApiRequest, NextApiResponse } from 'next';
import { Container } from 'typedi';
import { RampService } from '@/services/ramp.service';
import logger from '@/utils/logger';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { id } = req.query;
  const rampService = Container.get(RampService);

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing Ramp ID' });
  }

  if (req.method === 'GET') {
    try {
      const ramp = await rampService.getRampByQuery({
        _id: id,
      });
      if (!ramp) {
        return res.status(404).json({ error: 'Ramp not found' });
      }
      res.status(200).json(ramp);
    } catch (error) {
      const err = error as Error;
      logger.error(`Error fetching Ramp: ${err.message}`);
      res.status(500).json({ error: 'Failed to fetch Ramp' });
    }
  } else if (req.method === 'PUT') {
    try {
      const rampDto = req.body;
      const updatedRamp = await rampService.updateRamp(id, rampDto);
      if (!updatedRamp) {
        return res.status(404).json({ error: 'Ramp not found' });
      }
      res.status(200).json(updatedRamp);
    } catch (error) {
      const err = error as Error;
      logger.error(`Error updating Ramp: ${err.message}`);
      res.status(500).json({ error: 'Failed to update Ramp' });
    }
  } else if (req.method === 'DELETE') {
    try {
      await rampService.deleteRamp(id);
    } catch (error) {
      const err = error as Error;
      logger.error(`Error deleting Ramp: ${err.message}`);
      res.status(500).json({ error: 'Failed to delete Ramp' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
