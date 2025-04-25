import {
  ShippingAddressDTO,
  shippingAddressDTOConverter,
} from '@/dto/auctionBid.dto';
import { SaleModel } from '@/entities/sale.entity';
import { ShippingAddressModel } from '@/entities/shippingAddress';
import { connectMongoose } from '@/modules/mongodb.module';
import { Types } from 'mongoose';
import { Service } from 'typedi';
import { SaleDto } from '../entities/sale.entity';

export interface SaleMessageDTO {
  buyerMessage: ShippingAddressDTO | null;
  sellerMessage: ShippingAddressDTO | null;
}

@Service()
export class SaleService {
  async getSaleMessageByQuery(query: any): Promise<SaleMessageDTO | null> {
    await connectMongoose();
    // Get messages from the database
    const sale = await SaleModel.findOne(query)
      .populate({ path: 'buyerShippingId', model: ShippingAddressModel })
      .populate({ path: 'sellerShippingId', model: ShippingAddressModel })
      .exec();
    console.log(sale.toObject());

    if (!sale) {
      return null;
    }
    const { buyerShippingId, sellerShippingId } = sale.toObject();

    return {
      buyerMessage: buyerShippingId
        ? shippingAddressDTOConverter.convertFromEntity(buyerShippingId)
        : null,
      sellerMessage: sellerShippingId
        ? shippingAddressDTOConverter.convertFromEntity(sellerShippingId)
        : null,
    };
  }

  async getSaleMessageById(id: string): Promise<SaleMessageDTO | null> {
    return this.getSaleMessageByQuery({
      _id: new Types.ObjectId(id),
    });
  }

  async getSaleById(id: string): Promise<any | null> {
    await connectMongoose();
    const sale = await SaleModel.findById(id);
    return new SaleDto(sale.toObject());
  }
}
