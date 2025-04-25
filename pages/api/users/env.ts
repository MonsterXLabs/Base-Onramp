import { NextApiRequest, NextApiResponse } from 'next';

// /d:/4_work/7_rw_market/v2/VaultX_Frontend_Nextjs/pages/api/users/env.ts

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json(process.env);
}
