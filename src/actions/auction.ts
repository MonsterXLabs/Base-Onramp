'use client';

import {
  AuctionDTO,
  CancelAuctionDTO,
  CompleteAuctionDTO,
  GetAuctionDTO,
} from '@/dto/auction.dto';
import { AucitonBidDTO, createAuctionBidDTO } from '@/dto/auctionBid.dto';
import { getCookie } from '@/lib/cookie';
import axios, { AxiosResponse } from 'axios';

export const getAuctionApi = async (
  nftId: string,
): Promise<GetAuctionDTO | null> => {
  try {
    const res = await axios.get<GetAuctionDTO | null>(`/api/auction/${nftId}`);
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const createAuctionApi = async (
  auctionDto: AuctionDTO,
): Promise<AuctionDTO> => {
  const token = getCookie('token');

  try {
    const res = await axios.post<AuctionDTO, AxiosResponse<AuctionDTO>>(
      '/api/auction/create',
      auctionDto,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const auctionBidApi = async (
  auctionBidDto: createAuctionBidDTO,
): Promise<AucitonBidDTO> => {
  const token = getCookie('token');
  try {
    const res = await axios.post<
      createAuctionBidDTO,
      AxiosResponse<AucitonBidDTO>
    >(`/api/auction/bid`, auctionBidDto, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  } catch (error) {
    throw error;
  }
};

export const auctionBidListApi = async (
  nftId: string,
): Promise<GetAuctionDTO[]> => {
  try {
    const res = await axios.post<
      { nftId: string },
      AxiosResponse<GetAuctionDTO[]>
    >(`/api/auction/list`, {
      nftId,
    });

    return res.data;
  } catch (error) {
    throw error;
  }
};

export const cancelAuctionApi = async (
  cancelAuctionDto: CancelAuctionDTO,
): Promise<{
  message: string;
  status: boolean;
}> => {
  const token = getCookie('token');
  try {
    const res = await axios.post<
      any,
      {
        message: string;
        status: boolean;
      }
    >(`/api/auction/cancel`, cancelAuctionDto, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res;
  } catch (error) {
    throw error;
  }
};

export const completeAuctionApi = async (
  completeAuctionDto: CompleteAuctionDTO,
): Promise<{
  message: string;
  status: boolean;
}> => {
  try {
    const res = await axios.post<
      any,
      {
        message: string;
        status: boolean;
      }
    >(`/api/auction/complete`, completeAuctionDto, {});

    return res;
  } catch (error) {
    throw error;
  }
};
