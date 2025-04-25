import { SendbirdService } from '@/services/sendbird.service';
import type { NextApiRequest, NextApiResponse } from 'next';
import Container from 'typedi';
import { MailerSendService } from '@/services/mailersend.service';
import { SesService } from '@/services/ses.service';
import logger from '@/utils/logger';
import { MailGunService } from '@/services/mailgun.service';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const sendbirdService = Container.get(SendbirdService);
  const mailerSendService = Container.get(MailerSendService);
  const sesService = Container.get(SesService);
  const mailGunService = Container.get(MailGunService);

  if (req.method === 'POST') {
    // Handle POST request
    const { mode, ...rest } = req.body;

    // Add your logic to handle the notification here
    if (mode === 'unread') {
      const { sendFromId, sendToId, unread_count } = rest;
      // Send unread notification

      try {
        await Promise.all([
          sendbirdService.sendUnreadMessage(sendFromId, sendToId, unread_count),
          // mailerSendService.sendUnreadMessage(
          //   sendFromId,
          //   sendToId,
          //   unread_count,
          // ),
          sesService.sendUnreadMessage(sendFromId, sendToId, unread_count),
          // mailGunService.sendUnreadMessage(sendFromId, sendToId, unread_count),
        ]);
      } catch (error) {
        const err = error as Error;
        console.error('Error sending unread message:', error);
        logger.error(
          `Error sending unread message:, ${err.message}, ${err.stack}`,
        );
      }
    } else if (mode === 'register') {
      const { registerId } = rest;

      try {
        await Promise.all([
          sendbirdService.sendSignup(registerId),
          // mailerSendService.sendSignup(registerId),
          sesService.sendSignup(registerId),
          // mailGunService.sendSignup(registerId),
        ]);
      } catch (error) {
        const err = error as Error;
        console.error('Error sending signup notification:', error);
        logger.error(
          `Error sending signup notification:, ${err.message}, ${err.stack}`,
        );
      }
    } else if (mode === 'transaction') {
      const { event, nftId, actorId } = rest;
      try {
        await Promise.all([
          sendbirdService.sendTransactionByEvent(event, nftId, actorId),
          // mailerSendService.sendTransactionByEvent(event, nftId, actorId),
          sesService.sendTransactionByEvent(event, nftId, actorId),
          // mailGunService.sendTransactionByEvent(event, nftId, actorId),
        ]);
      } catch (error) {
        const err = error as Error;
        console.error('Error sending transaction notification:', error);
        logger.error(
          `Error sending transaction notification:, ${err.message}, ${err.stack}`,
        );
      }
    }
    res
      .status(200)
      .json({ success: true, message: 'Notification sent successfully' });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
