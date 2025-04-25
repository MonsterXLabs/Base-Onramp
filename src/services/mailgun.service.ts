import logger from '@/utils/logger';
import FormData from 'form-data'; // form-data v4.0.1
import Mailgun from 'mailgun.js'; // mailgun.js v11.1.0
import Container, { Service } from 'typedi';
import NftStateService from './nftState.service';
import { UserService } from './user.service';
import { NftService } from './nft.service';
import { SaleService } from './sale.service';
import { z } from 'zod';
import { SesService } from './ses.service';
import { log } from 'console';

const nftStateService = Container.get(NftStateService);
const userService = Container.get(UserService);
const nftService = Container.get(NftService);
const saleService = Container.get(SaleService);
const emailSchema = z.string().email();

const mailgun = new Mailgun(FormData);

const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_TOKEN,
  // When you have an EU-domain, you must specify the endpoint:
  // url: "https://api.eu.mailgun.net/v3"
});

const templateMapping = {
  MonsterXSignupTemplate: 'signup',
  TransactionRWATemplate: 'transaction',
  UnreadMessageTemplate: 'unread_message',
};

@Service()
export class MailGunService extends SesService {
  override readonly senderEmail: string = 'hans@support.vault-x.io';
  override async sendTemplatedEmail(
    emailTo: string,
    templateName: string,
    templateData: Record<string, any>,
  ) {
    emailSchema.parse(emailTo); // Validate email format

    try {
      const data = await mg.messages.create('support.vault-x.io', {
        from: 'hans@support.vault-x.io',
        to: [emailTo],
        subject: 'Hello MonsterX Labs Pte. Ltd.',
        template: templateMapping[templateName],
        'h:X-Mailgun-Variables': JSON.stringify(templateData),
      });
      console.log(data); // logs response data
    } catch (error) {
      console.log(error);
      logger.error(`Error sending templated email: ${error}`);
      throw `Error sending templated email: ${error}`;
    }
  }
}
