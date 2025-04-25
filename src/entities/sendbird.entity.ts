import { Schema, model, models, Document } from 'mongoose';

export interface ISendbird extends Document {
  participants: Schema.Types.ObjectId[];
  adminSupport: boolean;
  chatUrl: string;
  nftId?: Schema.Types.ObjectId;
  unreadMessages: {
    userId: string;
    unread_count: number;
    messages: string[];
  };
}

const sendbirdSchema = new Schema<ISendbird>(
  {
    participants: {
      type: [Schema.Types.ObjectId],
      ref: 'USER',
      validate: {
        validator: (participants) => {
          if (participants.length !== 2) {
            return false;
          }
          participants.sort((a, b) => a.toString().localeCompare(b.toString()));
          return true;
        },
        message: 'A chat must have exactly two participants.',
      },
    },
    adminSupport: {
      type: Boolean,
      default: false,
    },
    chatUrl: {
      type: String,
    },
    nftId: {
      type: Schema.Types.ObjectId,
      ref: 'NFT',
      required: false,
    },
    unreadMessages: {
      type: {
        userId: {
          type: String,
        },
        unread_count: {
          type: Number,
          default: 0,
        },
        messages: {
          type: [String],
          default: [],
        },
      },
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

models.Sendbird =
  models.Sendbird || model<ISendbird>('Sendbird', sendbirdSchema);

export const SendbirdModel = models.Sendbird;
