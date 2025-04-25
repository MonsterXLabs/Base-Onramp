import { SendbirdDTO } from '@/dto/sendbird.dto';
import { SendbirdModel } from '@/entities/sendbird.entity';
import { connectMongoose } from '@/modules/mongodb.module';
import { Types } from 'mongoose';
import Container, { Service } from 'typedi';
import * as SendbirdSdk from 'sendbird-platform-sdk-typescript';
import { UserService } from './user.service';
import { checksumAddress, shortenAddress } from 'thirdweb/utils';
import axios, { AxiosError } from 'axios';
import { UserDTO } from '@/dto/user.dto';
import { isDev } from '@/lib/contract';
import NftStateService from './nftState.service';
import { NotificationEvent } from '@/types';
import { NftService } from './nft.service';
import { SaleService } from './sale.service';
import NotificationTemplateConst from '@/i18n/en/notificationTemplate.json';
import { getEscrowEvents } from '@/lib/helper';

const userService = Container.get(UserService);
const nftStateService = Container.get(NftStateService);
const nftService = Container.get(NftService);
const saleService = Container.get(SaleService);

@Service({ global: true })
export class SendbirdService {
  private sendbirdApiInstance: SendbirdSdk.GroupChannelApi;
  private userSendbirdApiInstance: SendbirdSdk.UserApi;
  private messageApiInstance: SendbirdSdk.MessageApi;
  private sendbirdApiToken: string;
  private sendbirdApiUrl: string;
  private sendbirdNotificationApiUrl: string;
  private sendbirdNotificationApiToken: string;
  private adminId: string;
  private adminAccessToken: string;
  private readonly supportEmail = 'hans@info.vault-x.io';

  constructor() {
    const serverConfig = new SendbirdSdk.ServerConfiguration(
      process.env.SENDBIRD_API_URL,
      { app_id: process.env.NEXT_PUBLIC_APP_SENDBIRD_APPID },
    );

    const sendbirdConfiguration = SendbirdSdk.createConfiguration({
      baseServer: serverConfig,
    });
    this.sendbirdApiInstance = new SendbirdSdk.GroupChannelApi(
      sendbirdConfiguration,
    );
    this.userSendbirdApiInstance = new SendbirdSdk.UserApi(
      sendbirdConfiguration,
    );
    this.sendbirdApiToken = process.env.SENDBIRD_API_TOKEN || '';
    this.sendbirdApiUrl = process.env.SENDBIRD_API_URL || '';
    this.adminId = (process.env.SENDBIRD_ADMIN_ID as string) || '';
    this.adminAccessToken = process.env.SENDBIRD_ADMIN_ACCESS_TOKEN || '';
    this.sendbirdNotificationApiToken =
      process.env.SENDBIRD_NOTIFICATION_API_TOKEN || '';
    this.sendbirdNotificationApiUrl = `https://api-${process.env.NEXT_PUBLIC_APP_SENDBIRD_APPID}.notifications.sendbird.com`;
  }

  private getNickName(user: UserDTO) {
    return user?.username ?? shortenAddress(user?.wallet);
  }

  async getSendbirdByQuery(query: any): Promise<null | SendbirdDTO> {
    await connectMongoose();
    // Get sendbird from the database
    const sendbird = await SendbirdModel.findOne(query).exec();

    if (!sendbird) return null;

    return SendbirdDTO.fromEntity(sendbird.toObject());
  }

  async getSendbirdById(id: string): Promise<null | SendbirdDTO> {
    return this.getSendbirdByQuery({
      _id: new Types.ObjectId(id),
    });
  }

  getParticipants(userId1: string, userId2: string) {
    return [userId1, userId2]
      .sort((a, b) => a.localeCompare(b))
      .map((userId) => new Types.ObjectId(userId));
  }

  async getSendbirdByPaticipants(
    userId1: string,
    userId2: string,
  ): Promise<null | SendbirdDTO> {
    const participants = this.getParticipants(userId1, userId2);

    return this.getSendbirdByQuery({
      participants,
    });
  }

  async createSendbirdUser(userId: string) {
    await connectMongoose();
    const user = await userService.getUserById(userId);
    if (!user) throw new Error('user not found');

    await this.userSendbirdApiInstance.createUser(this.sendbirdApiToken, {
      userId: userId,
      nickname: user.username ?? shortenAddress(user.wallet),
      profileUrl: '',
    });
  }

  async createSendbird(userId1: string, userId2: string) {
    await connectMongoose();
    // check users
    try {
      const user1 = await this.userSendbirdApiInstance.viewUserById(
        this.sendbirdApiToken,
        userId1,
      );
    } catch (error) {
      await this.createSendbirdUser(userId1);
    }

    try {
      const user2 = await this.userSendbirdApiInstance.viewUserById(
        this.sendbirdApiToken,
        userId2,
      );
    } catch (error) {
      await this.createSendbirdUser(userId2);
    }

    // create group channel
    let body: SendbirdSdk.GcCreateChannelData = {
      userIds: [userId1, userId2],
      isDistinct: true,
    };

    const data: SendbirdSdk.SendBirdGroupChannel =
      await this.sendbirdApiInstance.gcCreateChannel(
        this.sendbirdApiToken,
        body,
      );

    let sendbird = await SendbirdModel.findOne({
      participants: this.getParticipants(userId1, userId2),
    }).exec();

    console.log(sendbird);
    if (!sendbird) {
      sendbird = new SendbirdModel({
        participants: this.getParticipants(userId1, userId2),
        chatUrl: data.channelUrl,
      });
      await sendbird.save();
    } else {
      sendbird.chatUrl = data.channelUrl;
      await sendbird.save();
    }

    return SendbirdDTO.fromEntity(sendbird.toObject());
  }

  async updateSendbird(id: string, data: Partial<SendbirdDTO>) {
    await connectMongoose();
    const sendbird = await SendbirdModel.findById(id).exec();

    if (!sendbird) return null;

    Object.assign(sendbird, data);

    await sendbird.save();

    return SendbirdDTO.fromEntity(sendbird.toObject());
  }

  async inviteAdmin(userId1: string, userId2: string): Promise<boolean> {
    await connectMongoose();
    const participants = this.getParticipants(userId1, userId2);

    const sendbird = await this.getSendbirdByQuery({
      participants,
    });

    if (!sendbird) return null;

    // check admin is joined
    let checkAdminRes: SendbirdSdk.GcCheckIfMemberByIdResponse =
      await this.sendbirdApiInstance.gcCheckIfMemberById(
        this.sendbirdApiToken,
        sendbird.chatUrl,
        this.adminId,
      );

    if (sendbird.adminSupport !== checkAdminRes.isMember) {
      sendbird.adminSupport = checkAdminRes.isMember;
      await this.updateSendbird(sendbird.id, {
        adminSupport: checkAdminRes.isMember,
      });
    }

    if (checkAdminRes.isMember) throw new Error('Admin already joined.');

    // invite admin
    // let body: SendbirdSdk.GcJoinChannelData = {
    //   channelUrl: sendbird.chatUrl,
    //   userId: this.adminId,
    //   accessCode: this.adminAccessToken,
    // };

    // await this.sendbirdApiInstance.gcJoinChannel(
    //   this.sendbirdApiToken,
    //   sendbird.chatUrl,
    //   body,
    // );

    await this.sendbirdApiInstance.gcInviteAsMembers(
      this.sendbirdApiToken,
      sendbird.chatUrl,
      {
        userIds: [this.adminId],
        channelUrl: sendbird.chatUrl,
        users: [],
        invitationStatus: {
          [this.adminId]: 'invited_by_friend',
        },
        hiddenStatus: {},
      },
    );

    await this.sendbirdApiInstance.gcAcceptInvitation(
      this.sendbirdApiToken,
      sendbird.chatUrl,
      {
        userId: this.adminId,
        channelUrl: sendbird.chatUrl,
        accessCode: this.adminAccessToken,
      },
    );

    await this.updateSendbird(sendbird.id, {
      adminSupport: true,
    });

    return true;
  }

  async updateSendbirdNft(userId1: string, userId2: string, nftId: string) {
    await connectMongoose();
    let sendbird = await SendbirdModel.findOne({
      participants: this.getParticipants(userId1, userId2),
    }).exec();

    if (!sendbird) return null;

    sendbird.nftId = new Types.ObjectId(nftId);

    await sendbird.save();

    return SendbirdDTO.fromEntity(sendbird.toObject());
  }

  async deleteSendbird(userId1: string, userId2: string): Promise<boolean> {
    await connectMongoose();
    const sendbird = await this.getSendbirdByPaticipants(userId1, userId2);

    if (!sendbird) throw new Error('Sendbird not found');

    const deleteRes: SendbirdSdk.OcDeleteChannelByUrl200Response =
      await this.sendbirdApiInstance.gcDeleteChannelByUrl(
        this.sendbirdApiToken,
        sendbird.chatUrl,
      );

    SendbirdModel.deleteOne({ _id: sendbird.id }).exec();
    return true;
  }

  async sendNotification(
    template_key: string,
    variables: Record<string, any>,
    targets: string[],
  ) {
    const notificationPayload = {
      // Define your notification payload here
      template: {
        key: template_key,
        variables,
      },
      targets,
      mode: 'realtime',
    };
    let attempts = 0;
    const maxAttempts = 3;
    while (attempts < maxAttempts) {
      try {
        // check user
        try {
          const user = await this.userSendbirdApiInstance.viewUserById(
            this.sendbirdApiToken,
            targets?.[0],
          );
        } catch (error) {
          await this.createSendbirdUser(targets?.[0]);
        }
        const response = await axios.post(
          `${this.sendbirdNotificationApiUrl}/v1/notifications/messages`,
          notificationPayload,
          {
            headers: {
              'Api-Token': this.sendbirdNotificationApiToken,
              'Content-Type': 'application/json',
            },
          },
        );

        console.log('Notification sent successfully');
        break; // Exit loop if successful
      } catch (error) {
        attempts++;
        console.log(`Attempt ${attempts} failed`);
        if (attempts >= maxAttempts) {
          console.log(error);
          if (error instanceof AxiosError) {
            console.log(error.response);
            console.error('Error sending notification:', error.response?.data);
          } else {
            console.error('Error sending notification');
          }
        }
      }
    }
  }

  async sendUnreadMessage(
    sendFromId: string,
    sendToId: string,
    unread_count: number,
  ) {
    const sendFrom = await userService.getUserById(sendFromId);
    const sendTo = await userService.getUserById(sendToId);

    const sendbird = await this.getSendbirdByPaticipants(sendFromId, sendToId);

    if (!sendFrom || !sendTo || !sendbird) {
      return;
    }
    const template_key = 'unread-chat-message';
    const sendFromName = this.getNickName(sendFrom);
    const sendToName = this.getNickName(sendTo);
    const nftUrl = isDev
      ? `https://testnet.vault-x.io/nft/${sendbird.nftId}`
      : `https://vault-x.io/nft/${sendbird.nftId}`;

    const sendToVariable = {
      name: sendToName,
      sender_name: sendFromName,
      unread_count,
      nft_url: nftUrl,
    };

    const variables = {
      [sendToId]: sendToVariable,
    };
    await this.sendNotification(template_key, variables, [sendTo.id]);
  }

  async sendSignup(registerId: string) {
    const register = await userService.getUserById(registerId);

    if (!register) {
      return;
    }

    const template_key = 'sign-up';
    const registerName = this.getNickName(register);
    const registerVariable = {
      name: registerName,
      account_name: 'MonsterX',
      support_email: this.supportEmail,
    };

    const variables = {
      [registerId]: registerVariable,
    };

    await this.sendNotification(template_key, variables, [register.id]);
  }

  async sendTransactionByStateList(activityIds: string[]) {
    const activities = await nftStateService.getNftSatesByIds(activityIds);
    const template_key = 'transaction';
    const targets = [];
    const variables = {};

    activities.forEach(async (activity) => {
      const buyer = activity.to;
      const seller = activity.from;
      const nftInfo = activity.nftId;
      const event_main = activity.state;
      const event_sub = activity.state;
      const nftUrl = isDev
        ? `https://testnet.vault-x.io/nft/${nftInfo.id}`
        : `https://vault-x.io/nft/${nftInfo.id}`;

      if (buyer && buyer.id) {
        targets.push(buyer.id);
        variables[buyer.id] = {
          name: this.getNickName(buyer),
          rwa_url: nftUrl,
          rwa_name: nftInfo?.name,
          rwa_event_sub: event_sub,
          support_email: this.supportEmail,
          rwa_event_main: event_main,
        };
      }

      if (seller && seller.id) {
        targets.push(seller.id);
        variables[seller.id] = {
          name: this.getNickName(seller),
          rwa_url: nftUrl,
          rwa_name: nftInfo?.name,
          rwa_event_sub: event_sub,
          support_email: this.supportEmail,
          rwa_event_main: event_main,
        };
      }
    });

    await Promise.all(
      targets.map((target) =>
        this.sendNotification(template_key, { [target]: variables[target] }, [
          target,
        ]),
      ),
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

    const template_key = 'transaction';
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
    const targets = [];
    const variables = {};

    if (seller && seller.id) {
      targets.push(seller.id);
      variables[seller.id] = {
        name: this.getNickName(seller),
        rwa_url: nftUrl,
        rwa_name: nftInfo?.name,
        rwa_event_sub: event_sub,
        support_email: this.supportEmail,
        rwa_event_main: event_main,
      };
    }
    if (
      event === 'purchased' ||
      event === 'escrow' ||
      event === 'escrow_cancel'
    ) {
      if (buyer && buyer.id) {
        targets.push(buyer.id);
        variables[buyer.id] = {
          name: this.getNickName(buyer),
          rwa_url: nftUrl,
          rwa_name: nftInfo?.name,
          rwa_event_sub: event_sub,
          support_email: this.supportEmail,
          rwa_event_main: event_main,
        };
      }
    }

    if (event === 'bid' || event === 'bid_cancel') {
      if (actor && actor.id) {
        targets.push(actor.id);
        variables[actor.id] = {
          name: this.getNickName(actor),
          rwa_url: nftUrl,
          rwa_name: nftInfo?.name,
          rwa_event_sub: event_sub,
          support_email: this.supportEmail,
          rwa_event_main: event_main,
        };
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
            if (recipient && recipient.id && recipient.id !== seller.id) {
              const splitVariables = {
                name: this.getNickName(recipient),
                rwa_url: nftUrl,
                rwa_name: nftInfo?.name,
                rwa_event_sub: split_event_main,
                support_email: this.supportEmail,
                rwa_event_main: split_event_sub,
              };
              await this.sendNotification(template_key, splitVariables, [
                recipient.id,
              ]);
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
              const royaltyVariables = {
                name: this.getNickName(recipient),
                rwa_url: nftUrl,
                rwa_name: nftInfo?.name,
                rwa_event_sub: royalty_event_main,
                support_email: this.supportEmail,
                rwa_event_main: royalty_event_sub,
              };
              await this.sendNotification(template_key, royaltyVariables, [
                recipient.id,
              ]);
            }
          }
        }),
      );
    }
    await Promise.all(
      targets.map((target) =>
        this.sendNotification(template_key, { [target]: variables[target] }, [
          target,
        ]),
      ),
    );
  }

  // unread messages
  public async fetchSendbirdByChatUrl(chatUrl: string) {
    const sendbird = await this.getSendbirdByQuery({
      chatUrl,
    });

    return sendbird;
  }

  public async setUnreadMessageFromSender(
    chatUrl: string,
    senderId: string,
    message: string,
  ) {
    let { participants, unreadMessages } =
      await this.fetchSendbirdByChatUrl(chatUrl);
    if (!participants.includes(senderId)) {
      throw new Error('Sender is not valid');
    }

    const receiver = participants.filter((userId) => userId !== senderId)?.[0];
    if (!receiver) throw new Error('Receiver is not valid');

    if (unreadMessages?.userId === receiver) {
      unreadMessages.unread_count += 1;
      unreadMessages.messages.push(message);
    } else {
      unreadMessages = {
        userId: receiver,
        unread_count: 1,
        messages: [message],
      };
    }

    console.log(unreadMessages);
    // save
    await SendbirdModel.updateOne({ chatUrl }, { unreadMessages }).exec();
  }

  public async setReadMessage(chatUrl: string, receiver: string) {
    let { participants, unreadMessages } =
      await this.fetchSendbirdByChatUrl(chatUrl);
    if (!participants.includes(receiver)) {
      throw new Error('Sender is not valid');
    }

    if (unreadMessages?.userId === receiver) {
      unreadMessages = {};
      await SendbirdModel.updateOne({ chatUrl }, { unreadMessages }).exec();
    }
  }
}
