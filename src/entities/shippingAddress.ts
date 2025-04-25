import { Schema, model, models, Document, Types } from 'mongoose';
import { z } from 'zod';

export interface IShippingAddress extends Document {
  name: string;
  email: string;
  country: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
  };
  phoneNumber: string;
  contactInformation: string;
  concent?: string;
  termsAccepted?: boolean;
  nftId: Schema.Types.ObjectId;
}

const ShippingAddressSchema = new Schema<IShippingAddress>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      validate: {
        validator: function (email: string) {
          const emailSchema = z.string().email();
          return emailSchema.safeParse(email).success;
        },
        message: (props: { value: string }) =>
          `${props.value} is not a valid email!`,
      },
    },
    country: {
      type: String,
      required: true,
    },
    address: {
      line1: {
        type: String,
        required: true,
      },
      line2: {
        type: String,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      postalCode: {
        type: String,
        required: true,
      },
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    contactInformation: {
      type: String,
      required: true,
    },
    concent: {
      type: String,
    },
    termsAccepted: {
      type: Boolean,
    },
    nftId: {
      type: Types.ObjectId,
      ref: 'Nft',
      required: true,
    },
  },
  { timestamps: true },
);

models.ShippingAddress =
  models.ShippingAddress ||
  model<IShippingAddress>('ShippingAddress', ShippingAddressSchema);

export const ShippingAddressModel = models.ShippingAddress;
