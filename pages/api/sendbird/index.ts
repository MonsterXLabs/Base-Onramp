import { SendbirdService } from '@/services/sendbird.service';
import { NextApiRequest, NextApiResponse } from 'next';
import Container from 'typedi';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  const sendbirdService = Container.get(SendbirdService);

  switch (method) {
    case 'GET':
      const { userId1, userId2 } = req.query;
      try {
        const sendbird = await sendbirdService.getSendbirdByPaticipants(
          userId1 as string,
          userId2 as string,
        );
        res.status(200).json(sendbird);
      } catch (error) {
        const err = error as Error;
        console.log(error);
        res.status(500).json({ error: err.message });
      }
      break;
    case 'POST':
      // Create a new post
      try {
        const { userId1, userId2, nftId } = req.body;
        let sendbird = await sendbirdService.createSendbird(userId1, userId2);
        if (nftId) {
          sendbird = await sendbirdService.updateSendbirdNft(
            userId1,
            userId2,
            nftId,
          );
        }
        res.status(201).json(sendbird);
      } catch (error) {
        const err = error as Error;
        console.log(error);
        res.status(500).json({ error: err.message });
      }
      break;

    case 'PUT':
      // Update a post
      try {
        const { userId1, userId2, mode, nftId } = req.body;
        if (mode === 'nft') {
          const result = await sendbirdService.updateSendbirdNft(
            userId1,
            userId2,
            nftId,
          );
          res.status(204).json(result);
        } else if (mode === 'admin') {
          const result = await sendbirdService.inviteAdmin(userId1, userId2);
          res.status(204).json(result);
        }
      } catch (error) {
        console.log(error);
        const err = error as Error;
        res.status(500).json({ error: err.message });
      }
      break;

    case 'DELETE':
      // Delete a post
      try {
        const { userId1, userId2 } = req.body;
        const result = await sendbirdService.deleteSendbird(userId1, userId2);
        res.status(204).json(result);
      } catch (error) {
        const err = error as Error;
        res.status(500).json({ error: err.message });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default handler;
