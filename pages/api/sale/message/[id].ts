import { SaleMessageDTO, SaleService } from '@/services/sale.service';
import { ErrorResponse } from '@/types';
import { NextApiRequest, NextApiResponse } from 'next';
import Container from 'typedi';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ErrorResponse | SaleMessageDTO>,
) {
  const { id } = req.query;
  const saleService = Container.get(SaleService);
  if (req.method === 'GET') {
    const result = await saleService.getSaleMessageById(id as string);
    res.status(200).json(result);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
