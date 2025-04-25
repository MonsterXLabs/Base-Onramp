import logger from '@/utils/logger';
import {
  SendRawEmailCommand,
  SendTemplatedEmailCommand,
  SESClient,
} from '@aws-sdk/client-ses';
import mailcomposer from 'mailcomposer';
import Container, { Service } from 'typedi';
import { Recipient, EmailParams, MailerSend, Sender } from 'mailersend';
import { UserDTO } from '@/dto/user.dto';
import { checksumAddress, shortenAddress } from 'thirdweb/utils';
import { NftDTO } from '@/dto/nft.dto';
import { isDev } from '@/lib/contract';
import NftStateService from './nftState.service';
import { UserService } from './user.service';
import { NotificationEvent } from '@/types';
import { NftService } from './nft.service';
import { SaleService } from './sale.service';
import NotificationTemplateConst from '@/i18n/en/notificationTemplate.json';
import { getEscrowEvents } from '@/lib/helper';
import { z } from 'zod';

const nftStateService = Container.get(NftStateService);
const userService = Container.get(UserService);
const nftService = Container.get(NftService);
const saleService = Container.get(SaleService);

const sesClient = new SESClient({
  region: process.env.ADMIN_AWS_REGION || 'ap-southeast-1', // Change it to match your region
  credentials: {
    accessKeyId: process.env.ADMIN_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.ADMIN_AWS_SECRET_ACCESS_KEY || '',
  },
});

const emailSchema = z.string().email();

const buildEmail = (emailTo: string) => {
  return mailcomposer({
    to: [emailTo], // success@simulator.amazonses.com (can be used for testing)
    from: 'noreply@monsterx.io',
    html: `
            <h1>Orders from Website</h1>
            <p>Please download the attached CSV</p>
            `,
    subject: `Ecommerce - CSV Export`,
  });
};

export const sendEmail = async (emailTo: string) => {
  emailSchema.parse(emailTo); // Validate email format

  const email = await new Promise<any>((resolve, reject) => {
    buildEmail(emailTo).build((err: any, message: any) => {
      if (err) {
        reject(`Error building email: ${err}`);
      } else {
        resolve(message);
      }
    });
  });

  try {
    const data = await sesClient.send(
      new SendRawEmailCommand({ RawMessage: { Data: email } }),
    );
    console.log('Email Message Id: ', data.MessageId);
  } catch (error) {
    console.log(error);
    throw `Error sending raw email: ${error}`;
  }
};

@Service()
export class SesService {
  readonly senderEmail: string = 'noreply@monsterx.io';

  async sendTemplatedEmail(emailTo: string, templateName, templateData: any) {
    emailSchema.parse(emailTo); // Validate email format

    const params = {
      Destination: {
        ToAddresses: [emailTo],
      },
      Source: 'noreply@monsterx.io',
      Template: templateName, // Replace with your SES template name
      TemplateData: JSON.stringify(templateData),
    };

    try {
      const data = await sesClient.send(new SendTemplatedEmailCommand(params));
      console.log('Templated Email Message Id: ', data.MessageId, params);
    } catch (error) {
      console.log(error);
      throw `Error sending templated email: ${error}`;
    }
  }

  private getNickName(user: UserDTO) {
    return user?.username ?? shortenAddress(user?.wallet);
  }
  // unread message
  public async sendUnreadMessage(
    sendFromId: string,
    sendToId: string,
    unread_count: number,
  ) {
    const sendFrom = await userService.getUserById(sendFromId);
    const sendTo = await userService.getUserById(sendToId);
    if (!sendFrom || !sendTo) {
      return;
    }
    const templateId = 'UnreadMessageTemplate';
    const sendFromName = this.getNickName(sendFrom);
    const sendToName = this.getNickName(sendTo);

    const variables = {
      name: sendToName,
      user: {
        name: sendToName,
      },
      comment: {
        date: new Date().toISOString(),
      },
      account_name: sendFromName,
      unread_count,
    };

    await this.sendTemplatedEmail(sendTo.email, templateId, variables);
  }

  // signup message
  public async sendSignup(registerId: string) {
    const register = await userService.getUserById(registerId);
    if (!register) {
      return;
    }

    const templateId = 'MonsterXSignupTemplate';
    const registerName = this.getNickName(register);
    const variables = {
      userName: registerName,
      account_name: 'MonsterX',
      support_email: this.senderEmail,
    };

    await this.sendTemplatedEmail(register.email, templateId, variables);
  }

  async sendTransactionByEvent(
    event: NotificationEvent,
    nftId: string,
    actorId: string = '',
  ) {
    const nftInfo = await nftService.getNftById(nftId);
    if (!nftInfo) {
      return;
    }

    const templateId = 'TransactionRWATemplate';
    // get sale
    const saleInfo = await saleService.getSaleById(nftInfo.saleId?.toString());
    if (!saleInfo) {
      return;
    }

    const { event_main, event_sub } = NotificationTemplateConst[event];
    const buyer = saleInfo?.saleWinner
      ? await userService.getUserById(saleInfo?.saleWinner.toString())
      : null;
    const seller = nftInfo?.owner
      ? await userService.getUserById(nftInfo.owner?.toString())
      : null;
    const actor = actorId ? await userService.getUserById(actorId) : null;
    const nftUrl = isDev
      ? `https://testnet.vault-x.io/nft/${nftInfo.id}`
      : `https://vault-x.io/nft/${nftInfo.id}`;
    const emailList = [];
    const variableList = [];

    if (seller && seller.email) {
      emailList.push(seller.email);
      variableList.push({
        account: {
          name: 'Monsterx',
        },
        name: this.getNickName(seller),
        rwa_url: nftUrl,
        rwa_name: nftInfo?.name,
        rwa_event_sub: event_sub,
        support_email: this.senderEmail,
        rwa_event_main: event_main,
      });
    }
    if (
      event === 'purchased' ||
      event === 'escrow' ||
      event === 'escrow_cancel'
    ) {
      if (buyer && buyer.email) {
        emailList.push(buyer.email);
        variableList.push({
          account: {
            name: 'Monsterx',
          },
          name: this.getNickName(buyer),
          rwa_url: nftUrl,
          rwa_name: nftInfo?.name,
          rwa_event_sub: event_sub,
          support_email: this.senderEmail,
          rwa_event_main: event_main,
        });
      }
    }

    if (event === 'bid' || event === 'bid_cancel') {
      if (actor && actor.id) {
        emailList.push(actor.email);
        variableList.push({
          account: {
            name: 'Monsterx',
          },
          name: this.getNickName(actor),
          rwa_url: nftUrl,
          rwa_name: nftInfo?.name,
          rwa_event_sub: event_sub,
          support_email: this.senderEmail,
          rwa_event_main: event_main,
        });
      }
    }

    if (event === 'escrow' && saleInfo.saleEndTxnHash) {
      const escrowEvents = await getEscrowEvents(saleInfo.saleEndTxnHash);
      await Promise.all(
        escrowEvents.map(async (web3Event) => {
          if (web3Event.eventName === 'PaymentSplited') {
            const recipient = await userService.getUserByQuery({
              wallet: checksumAddress(web3Event.args.user),
            });
            const { event_main: split_event_main, event_sub: split_event_sub } =
              NotificationTemplateConst.split;
            if (recipient && recipient.email && recipient.id !== seller.id) {
              emailList.push(recipient.email);
              variableList.push({
                account: {
                  name: 'Monsterx',
                },
                name: this.getNickName(recipient),
                rwa_url: nftUrl,
                rwa_name: nftInfo?.name,
                rwa_event_sub: split_event_sub,
                support_email: this.senderEmail,
                rwa_event_main: split_event_main,
              });
            }
          } else if (web3Event.eventName === 'RoyaltyPurchased') {
            const recipient = await userService.getUserByQuery({
              wallet: checksumAddress(web3Event.args.user),
            });
            const {
              event_main: royalty_event_main,
              event_sub: royalty_event_sub,
            } = NotificationTemplateConst.royalty;
            if (recipient && recipient.id) {
              emailList.push(recipient.email);
              variableList.push({
                account: {
                  name: 'Monsterx',
                },
                name: this.getNickName(recipient),
                rwa_url: nftUrl,
                rwa_name: nftInfo?.name,
                rwa_event_sub: royalty_event_sub,
                support_email: this.senderEmail,
                rwa_event_main: royalty_event_main,
              });
            }
          }
        }),
      );
    }
    await Promise.all(
      emailList.map((email, index) =>
        this.sendTemplatedEmail(email, templateId, variableList[index]),
      ),
    );
  }
}
