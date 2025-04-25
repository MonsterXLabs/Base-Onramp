import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import getRawBody from 'raw-body';
import Container from 'typedi';
import { SendbirdService } from '@/services/sendbird.service';
import { GlobalSettingService } from '@/services/globalSetting.service';
import { MailerSendService } from '@/services/mailersend.service';
import logger from '@/utils/logger';
import { SesService } from '@/services/ses.service';
import { MailGunService } from '@/services/mailgun.service';

const API_TOKEN = process.env.SENDBIRD_API_TOKEN;

let callbackList = {};

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const sendbirdService = Container.get(SendbirdService);
  const globalSettingService = Container.get(GlobalSettingService);
  const mailerSendService = Container.get(MailerSendService);
  const sesService = Container.get(SesService);
  const mailGunService = Container.get(MailGunService);

  const callbackTime =
    Number(
      await globalSettingService.getGlobalSettingByKey('SENDBIRD_CALLBACK'),
    ) ?? 60;

  try {
    // check signature
    const rawBody = await getRawBody(req, {
      encoding: 'utf-8',
    });

    const signature = req.headers['x-sendbird-signature'] as string | undefined;
    if (!signature) {
      return res
        .status(400)
        .json({ message: 'Missing x-sendbird-signature header' });
    }

    // Create HMAC hash of the raw body
    const hash = crypto
      .createHmac('sha256', API_TOKEN)
      .update(rawBody)
      .digest('hex');

    // Compare signature and hash
    if (signature === hash) {
      const { category, ...restJson } = JSON.parse(rawBody); // Parse the body into JSON after validation
      if (category === 'group_channel:message_send') {
        const {
          channel: { channel_url },
          sender: { user_id },
          payload: { message },
        } = restJson;
        const sendbird =
          await sendbirdService.fetchSendbirdByChatUrl(channel_url);
        if (sendbird && sendbird.participants.includes(user_id)) {
          await sendbirdService.setUnreadMessageFromSender(
            channel_url,
            user_id,
            message,
          );
          // set time out callback
          if (callbackList[channel_url]) {
            clearTimeout(callbackList[channel_url]);
          }
          callbackList[channel_url] = setTimeout(async () => {
            const { unreadMessages, participants } =
              await sendbirdService.fetchSendbirdByChatUrl(channel_url);
            if (unreadMessages?.userId && unreadMessages?.unread_count) {
              const senderId = participants.filter(
                (user_id) => user_id !== unreadMessages.userId,
              )?.[0];
              try {
                await Promise.all([
                  sendbirdService.sendUnreadMessage(
                    senderId,
                    unreadMessages.userId,
                    unreadMessages.unread_count,
                  ),
                  // mailerSendService.sendUnreadMessage(
                  //   senderId,
                  //   unreadMessages.userId,
                  //   unreadMessages.unread_count,
                  // ),
                  sesService.sendUnreadMessage(
                    senderId,
                    unreadMessages.userId,
                    unreadMessages.unread_count,
                  ),
                  // mailGunService.sendUnreadMessage(
                  //   senderId,
                  //   unreadMessages.userId,
                  //   unreadMessages.unread_count,
                  // ),
                ]);
              } catch (error) {
                const err = error as Error;
                logger.error(
                  `Error sending unread message: ${err.message}, stack: ${err.stack}`,
                );
                console.error('Error sending unread message:', error);
              }
            }
          }, callbackTime * 1000);
        }
      } else if (category === 'group_channel:message_read') {
        const {
          channel: { channel_url },
          read_updates,
        } = restJson;
        if (read_updates?.[0]) {
          await sendbirdService.setReadMessage(
            channel_url,
            read_updates?.[0].user_id,
          );
        }
      }
      return res
        .status(200)
        .json({ message: 'Signature validated successfully' });
    } else {
      return res.status(401).json({ message: 'Invalid signature' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default handler;
