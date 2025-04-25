// /d:/4_work/7_rw_market/v2/VaultX_Frontend_Nextjs/pages/api/moonpay/transaction_status.js
import { TransactionStatusResponse } from '@/dto/moonpay/moonpayTransaction.dto';
import { MoonpayTransactionService } from '@/services/moonpay.service';
import { ErrorResponse } from '@/types';
import logger from '@/utils/logger';
import { NextApiRequest, NextApiResponse } from 'next';
import Container from 'typedi';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    | ErrorResponse
    | {
        data: TransactionStatusResponse[];
      }
  >,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  logger.info(
    `Fetching transaction status for transactionIds: ${req.query.id}, URL: ${req.url}`,
  );

  const { id: transactionIds } = req.query;
  const moonpayServices = Container.get(MoonpayTransactionService);
  if (!transactionIds) {
    return res.status(400).json({ error: 'Transaction ID is required' });
  }

  try {
    const transactions = await moonpayServices.transactionStatus(
      transactionIds as string,
    );
    res.status(200).json({
      data: transactions,
    });
  } catch (error) {
    const err = error as Error;
    logger.error(
      `Failed to fetch asset info: ${err.message}, stack: ${err.stack}`,
    );
    return res.status(404).json({ error: err.message });
  }
}
