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

const nftStateService = Container.get(NftStateService);
const userService = Container.get(UserService);
const nftService = Container.get(NftService);
const saleService = Container.get(SaleService);

@Service()
export class MailerSendService {
  private readonly apiToken: string = process.env.MAILERSEND_API_TOKEN!;
  private readonly senderEmail: string = 'hans@info.vault-x.io';

  private async sendEmail(
    templateId: string,
    to: string,
    subject: string,
    variables: Record<string, any>,
  ): Promise<void> {
    const mailersend = new MailerSend({
      apiKey: this.apiToken,
    });

    const sender = new Sender(this.senderEmail);
    const recipients = [new Recipient(to, 'Recipient')];

    const personalization = [
      {
        email: to,
        data: variables,
      },
    ];

    const emailParams = new EmailParams()
      .setFrom(sender)
      .setTo(recipients)
      .setSubject(subject)
      .setTemplateId(templateId)
      .setPersonalization(personalization);

    try {
      await mailersend.email.send(emailParams);
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  private async sendBulkEmail(
    templateId: string,
    to: string[],
    subject: string,
    variableList: Record<string, any>[],
  ) {
    if (to.length !== variableList.length) {
      throw new Error(
        'The length of the recipient list and the variable list must be the same',
      );
    }

    const mailerSend = new MailerSend({
      apiKey: this.apiToken,
    });

    const sender = new Sender(this.senderEmail);
    const bulkEmails = [];

    to.forEach((email, index) => {
      const recipient = new Recipient(email, 'Recipient');
      const personalization = [
        {
          email,
          data: variableList[index],
        },
      ];
      const emailParams = new EmailParams()
        .setFrom(sender)
        .setTo([recipient])
        .setSubject(subject)
        .setTemplateId(templateId)
        .setPersonalization(personalization);

      bulkEmails.push(emailParams);
    });

    console.log('test');
    console.log(bulkEmails);
    await Promise.all(
      bulkEmails.map(async (emailParams) => {
        await mailerSend.email.send(emailParams);
      }),
    );
    // try {
    //   await mailerSend.email.sendBulk(bulkEmails);
    //   console.log('Bulk email sent successfully');
    // } catch (error) {
    //   console.error('Error sending bulk email:', error);
    //   throw new Error('Failed to send bulk email');
    // }
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
    const templateId = 'z3m5jgr1npx4dpyo';
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

    await this.sendEmail(templateId, sendTo.email, 'Unread Message', variables);
  }

  // signup message
  public async sendSignup(registerId: string) {
    const register = await userService.getUserById(registerId);
    if (!register) {
      return;
    }

    const templateId = 'vywj2lp1jpkl7oqz';
    const registerName = this.getNickName(register);
    const variables = {
      name: registerName,
      account_name: 'MonsterX',
      support_email: this.senderEmail,
    };

    await this.sendEmail(templateId, register.email, 'Sign Up', variables);
  }

  public async sendTransaction(
    buyer: UserDTO,
    seller: UserDTO,
    nftInfo: NftDTO,
    event_main: string,
    event_sub: string,
  ) {
    const templateId = '7dnvo4d8dn3l5r86';
    const buyerName = this.getNickName(buyer);
    const sellerName = this.getNickName(seller);

    const nftUrl = isDev
      ? `https://testnet.vault-x.io/nft/${nftInfo.id}`
      : `https://vault-x.io/nft/${nftInfo.id}`;

    const variableList = [
      {
        account: {
          name: 'Monsterx',
        },
        name: buyerName,
        rwa_url: nftUrl,
        rwa_name: nftInfo.name,
        rwa_event_sub: event_sub,
        support_email: this.senderEmail,
        rwa_event_main: event_main,
      },
      {
        account: {
          name: 'Monsterx',
        },
        rwa_url: nftUrl,
        rwa_name: nftInfo.name,
        rwa_event_sub: event_sub,
        support_email: this.senderEmail,
        rwa_event_main: event_main,
      },
    ];

    await this.sendBulkEmail(
      templateId,
      [buyer.email, seller.email],
      'MonsterX Transaction',
      variableList,
    );
  }

  public async sendTransactionByStateList(activityIds: string[]) {
    const activities = await nftStateService.getNftSatesByIds(activityIds);
    const templateId = '7dnvo4d8dn3l5r86';
    const emailList = [];
    const variableList = [];
    activities.forEach(async (activity) => {
      const buyer = activity.to;
      const seller = activity.from;
      const nftInfo = activity.nftId;
      const event_main = activity.state;
      const event_sub = activity.state;
      const nftUrl = isDev
        ? `https://testnet.vault-x.io/nft/${nftInfo.id}`
        : `https://vault-x.io/nft/${nftInfo.id}`;

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

      if (seller) {
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
    });

    await this.sendBulkEmail(
      templateId,
      emailList,
      'MonsterX Transaction',
      variableList,
    );
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

    const templateId = '7dnvo4d8dn3l5r86';
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
    await this.sendBulkEmail(
      templateId,
      emailList,
      'MonsterX Transaction',
      variableList,
    );
  }
}
