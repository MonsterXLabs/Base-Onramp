import { SendbirdDTO } from '@/dto/sendbird.dto';
import axios, { AxiosResponse } from 'axios';

export const getSendbird = async (
  userId1: string,
  userId2: string,
): Promise<SendbirdDTO | null> => {
  try {
    const res = await axios.get<SendbirdDTO | null>(
      `/api/sendbird/?userId1=${userId1}&userId2=${userId2}`,
    );
    return res.data;
  } catch (error) {
    throw error;
  }
};
export const createSendbird = async (
  userId1: string,
  userId2: string,
  nftId?: string,
): Promise<null | SendbirdDTO> => {
  try {
    const res = await axios.post<
      { userId1: string; userId2: string; nftId?: string },
      AxiosResponse<SendbirdDTO | null>
    >('/api/sendbird', {
      userId1,
      userId2,
      nftId,
    });

    return res.data;
  } catch (error) {
    throw error;
  }
};

export const inviteAdmin = async (
  userId1: string,
  userId2: string,
): Promise<boolean> => {
  try {
    const res = await axios.put<
      {
        userId1: string;
        userId2: string;
        mode: 'admin' | 'nft';
      },
      AxiosResponse<boolean>
    >('/api/sendbird', {
      userId1,
      userId2,
      mode: 'admin',
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const updateWithNft = async (
  userId1: string,
  userId2: string,
  nftId: string,
): Promise<SendbirdDTO> => {
  try {
    const res = await axios.put<
      {
        userId1: string;
        userId2: string;
        mode: 'admin' | 'nft';
        nftId: string;
      },
      AxiosResponse<SendbirdDTO>
    >('/api/sendbird', {
      userId1,
      userId2,
      mode: 'nft',
      nftId,
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};
