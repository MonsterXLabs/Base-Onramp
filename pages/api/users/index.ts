import { UserService } from '@/services/user.service';
import { NextApiRequest, NextApiResponse } from 'next';
import Container from 'typedi';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const userServices = Container.get(UserService);
  if (req.method === 'POST') {
    // save user
    return res.status(200).json({ succes: true });
  } else if (req.method === 'GET') {
    // get user
    const { id } = req.query;
    const user = await userServices.getUserById(id as string);
    return res.status(200).json(user);
  }
}
