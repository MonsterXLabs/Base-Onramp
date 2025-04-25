import { SaleMessageDTO } from '@/services/sale.service';
import axios from 'axios';

export const getSaleMessage = async (
  saleId: string,
): Promise<SaleMessageDTO | null> => {
  try {
    const res = await axios.get<SaleMessageDTO | null>(
      `/api/sale/message/${saleId}`,
    );
    return res.data;
  } catch (error) {
    throw error;
  }
};
