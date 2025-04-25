import { CurationType, NFTItemType, UserType } from '@/types';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Address } from 'thirdweb';
import { getCookie } from '../../lib/cookie';

const server_uri =
  process.env.NEXT_PUBLIC_APP_BACKEND_URL || 'https://api.vault-x.io/api/v2';

const options = {
  baseURL: server_uri,
  headers: {
    authorization: 'Bearer ' + getCookie('token'),
  },
};

const api: AxiosInstance = axios.create(options);

interface NftDetails {
  // Define the structure of nftDetails object
}

interface CollectionData {
  // Define the structure of collection data object
}

interface LaunchpadDetails {
  // Define the structure of launchpadDetails object
}

interface UserData {
  // Define the structure of user data object
}

interface SaleData {
  // Define the structure of sale data object
}

interface ConnectWalletParams {
  wallet: Address;
}

interface LogoutParams {
  accessToken: string;
}

interface GetUserByIdParams {
  userId: string;
}

interface SubscribeEmailParams {
  email: string;
  subject: string;
  content: string;
}

interface ContactUsParams {
  email: string;
  content: string;
  name: string;
  contactNumber: string;
}

type UpdateProfileParams = Partial<Omit<UserType, '_id'>>;

interface GetArtistsParams {
  data: Record<string, unknown>;
}

interface IGetSearchRequest {
  filterString: string;
}

export interface IGetSearchResponse {
  success: boolean;
  nfts: Array<Partial<NFTItemType>>;
  curations: Array<Partial<CurationType>>;
  artistsNfts: Array<Partial<NFTItemType>>;
  users: Array<Partial<UserType>>;
}

// API calls for NFTs
export const nftServices = {
  createNft: (nftDetails: NftDetails): Promise<AxiosResponse<any>> => {
    const token = getCookie('token');
    api.defaults.headers.common['authorization'] = token;
    return api.post(`${server_uri}/nft/create`, nftDetails);
  },
  getNftByUserAddress: async (
    limit: number,
    chain: string,
    address: string,
    cursor?: string,
  ): Promise<AxiosResponse<any>> => {
    if (cursor)
      return api.post(`${server_uri}/nft/nftByUserAddress`, {
        address,
        limit,
        cursur: cursor,
        chainId: chain,
      });
    return api.post(`${server_uri}/nft/nftByUserAddress`, {
      address,
      limit,
      chainId: chain,
    });
  },
  getNftByTokenId: async (
    chainId: string,
    address: string,
    tokenId: string,
  ): Promise<AxiosResponse<any>> => {
    return api.get(
      `${server_uri}/nft/singleNft/${chainId}/${address}/${tokenId}`,
    );
  },
  getListedNfts: async (
    limit: number,
    chainId: string,
    address: string,
    nftStatus: string,
    cursor?: string,
    sort?: string,
  ): Promise<AxiosResponse<any>> => {
    return api.post(`${server_uri}/nft/getListedNfts/`, {
      address,
      limit,
      chainId,
      nftStatus,
      cursor,
      sort,
    });
  },
  getBids: async (
    limit: number,
    chainId: string,
    cursor?: string,
  ): Promise<AxiosResponse<any>> => {
    return api.post(`${server_uri}/nft/getBids/`, {
      limit,
      chainId,
      cursor,
    });
  },
  getSingleListedNft: async (
    chainId: string,
    address: string,
    tokenId: string,
  ): Promise<AxiosResponse<any>> => {
    return api.get(
      `${server_uri}/nft/getSingleListedNft/${chainId}/${address}/${tokenId}`,
    );
  },
  getLengths: async (
    limit: number,
    chain: string,
    address: string,
  ): Promise<AxiosResponse<any>> => {
    return api.post(`${server_uri}/nft/getLengths/`, {
      address,
      limit,
      chainId: chain,
    });
  },
  getAllNfts: (skip: number, auctionId: string): Promise<AxiosResponse<any>> =>
    api.get(`${server_uri}/nft/getAllExplore/${skip}/${auctionId}`),
  addLikes: (
    accessToken: string,
    nftId: string,
    userAddress: string,
  ): Promise<AxiosResponse<any>> => {
    api.defaults.headers.common['authorization'] = accessToken;
    return api.post(`${server_uri}/nft/addLikes`, {
      nftId,
      userAddress,
    });
  },
  removeLike: (
    accessToken: string,
    nftId: string,
    userAddress: string,
  ): Promise<AxiosResponse<any>> => {
    api.defaults.headers.common['authorization'] = accessToken;
    return api.post(`${server_uri}/nft/removeLike`, {
      nftId,
      userAddress,
    });
  },
  createListing: (nftDetails: NftDetails): Promise<AxiosResponse<any>> => {
    const token = getCookie('token');
    api.defaults.headers.common['authorization'] = token;
    return api.post(`${server_uri}/nft/create-listing`, nftDetails);
  },
  transfer: (nftDetails: NftDetails): Promise<AxiosResponse<any>> => {
    const token = getCookie('token');
    api.defaults.headers.common['authorization'] = token;
    return api.post(`${server_uri}/nft/transfer`, nftDetails);
  },
  nftRanking: (skip: number, days: number): Promise<AxiosResponse<any>> => {
    return api.get(`${server_uri}/nft/nftRanking/${days}/${skip}`);
  },
};

// API calls for collections
export const collectionServices = {
  create: (data: CollectionData): Promise<AxiosResponse<any>> =>
    api.post(`${server_uri}/collection/create`, data, {
      headers: {
        authorization: 'Bearer ' + getCookie('token'),
      },
    }),
  update: (data: CollectionData): Promise<AxiosResponse<any>> =>
    api.post(`${server_uri}/collection/updateCuration`, data, {
      headers: {
        authorization: 'Bearer ' + getCookie('token'),
      },
    }),
  getAllCollections: (data: CollectionData): Promise<AxiosResponse<any>> =>
    api.post(`${server_uri}/collection/getAllCollections`, data),
  getTrendingCollections: (): Promise<AxiosResponse<any>> =>
    api.get(`${server_uri}/nft/getTrendingCollections`),
  getCollectionById: (collectionId: string): Promise<AxiosResponse<any>> =>
    api.get(`${server_uri}/collection/getCollectionById/${collectionId}`),
  getCollectionInfo: (collectionId: string): Promise<AxiosResponse<any>> =>
    api.post(`${server_uri}/collection/getCollectionInfo/`, { collectionId }),
  getCollectionNfts: (data: CollectionData): Promise<AxiosResponse<any>> =>
    api.post(`${server_uri}/collection/getCollectionNts/`, data),
  getUserCollections: (data: CollectionData): Promise<AxiosResponse<any>> =>
    api.post(`${server_uri}/collection/getUserCollection`, data, {
      headers: {
        authorization: 'Bearer ' + getCookie('token'),
      },
    }),
  getUserCollectionsInfo: (): Promise<AxiosResponse<any>> =>
    api.get(`${server_uri}/collection/getUserCollectionsInfo`),
  getCollectionsByUserId: (data: CollectionData): Promise<AxiosResponse<any>> =>
    api.post(`${server_uri}/collection/getCollectionByUserId`, data),
  getCollectionByAddress: (
    chainId: string,
    address: string,
    limit: number,
    filter: string,
    sort: string,
    skip: number,
    cursor?: string,
  ): Promise<AxiosResponse<any>> =>
    api.post(`${server_uri}/nft/getCollectionByAddress`, {
      address,
      limit,
      chainId,
      filter,
      sort,
      skip,
      cursor,
    }),
  getCollectionMetadata: (
    chainId: string,
    address: string,
  ): Promise<AxiosResponse<any>> =>
    api.post(`${server_uri}/nft/collectionMetadata`, {
      address,
      chainId,
    }),
  getAllActivitiesCollection: (
    data: CollectionData,
  ): Promise<AxiosResponse<any>> =>
    api.post(`${server_uri}/collection/getCollectionActivities/`, data),
  getSearch: (data: IGetSearchRequest): Promise<IGetSearchResponse> => {
    return api
      .post(`${server_uri}/collection/search`, data)
      .then((res: AxiosResponse) => {
        return res.data;
      })
      .catch((err) => err);
  },
};

// API calls for auctions
export const auctionServices = {
  placeBid: (bidDetails: any): Promise<AxiosResponse<any>> => {
    const token = getCookie('token');
    api.defaults.headers.common['authorization'] = token;
    return api.post(`${server_uri}/auction/placeBid`, bidDetails);
  },
  buy: (
    nftId: string,
    endAuctionHash: string,
    userAddress: string,
    contractAddress: string,
    buyer_currency: string,
    txHash: string,
    bnbPrice: string,
  ): Promise<AxiosResponse<any>> => {
    const token = getCookie('token');
    api.defaults.headers.common['authorization'] = token;
    return api.post(`${server_uri}/auction/buy`, {
      nftId,
      endAuctionHash,
      userAddress,
      contractAddress,
      buyer_currency,
      txHash,
      bnbPrice,
    });
  },
  getAllExplore: (
    limit: number,
    skip: number,
    chain: string,
    sort: string,
    filter: string,
  ): Promise<AxiosResponse<any>> =>
    api.get(
      `${server_uri}/auction/getAllExplore/${limit}/${skip}/${chain}/${sort}/${filter}`,
    ),
  endSaleApi: (
    nftId: string,
    endAuctionHash: string,
    bnbPrice: string,
    auctionOwner: string,
  ): Promise<AxiosResponse<any>> => {
    const token = getCookie('token');
    api.defaults.headers.common['authorization'] = token;
    return api.post(`${server_uri}/auction/end`, {
      nftId,
      endAuctionHash,
      bnbPrice,
      auctionOwner,
    });
  },
  cancelAuction: (
    nftId: string,
    transactionHash: string,
  ): Promise<AxiosResponse<any>> => {
    const token = getCookie('token');
    api.defaults.headers.common['authorization'] = token;
    return api.post(`${server_uri}/auction/cancel`, { nftId, transactionHash });
  },
  getAllAuctionNfts: (
    limit: number,
    skip: number,
  ): Promise<AxiosResponse<any>> => {
    const token = getCookie('token');
    api.defaults.headers.common['authorization'] = token;
    return api.post(`${server_uri}/auction/getAllAuctionNfts`, { limit, skip });
  },
  getNftAuctionById: (auctionId: string): Promise<AxiosResponse<any>> => {
    const token = getCookie('token');
    api.defaults.headers.common['authorization'] = token;
    return api.get(`${server_uri}/auction/getAuctionNft/${auctionId}`);
  },
  auctionRanking: (skip: number, days: number): Promise<AxiosResponse<any>> => {
    const token = getCookie('token');
    api.defaults.headers.common['authorization'] = token;
    return api.get(`${server_uri}/auction/auctionRanking/${days}/${skip}`);
  },
};

// API calls for launchpads
export const launchpadServices = {
  create: (launchpadDetails: LaunchpadDetails): Promise<AxiosResponse<any>> => {
    const token = getCookie('token');
    api.defaults.headers.common['authorization'] = token;
    return api.post(`${server_uri}/launchpad/create`, launchpadDetails);
  },
  update: (launchpadDetails: LaunchpadDetails): Promise<AxiosResponse<any>> => {
    const token = getCookie('token');
    api.defaults.headers.common['authorization'] = token;
    return api.post(`${server_uri}/launchpad/update`, launchpadDetails);
  },
  getLaunchpads: (): Promise<AxiosResponse<any>> =>
    api.get(`${server_uri}/launchpad/getLaunchpads`),
  getLaunchpadById: (launchpadId: string): Promise<AxiosResponse<any>> =>
    api.get(`${server_uri}/launchpad/getLaunchpadById/${launchpadId}`),
};

// API calls for sales
export const saleServices = {
  createSale: (saleDetails: SaleData): Promise<AxiosResponse<any>> => {
    const token = getCookie('token');
    api.defaults.headers.common['authorization'] = token;
    return api.post(`${server_uri}/sale/create`, saleDetails);
  },
  getSaleById: (saleId: string): Promise<AxiosResponse<any>> =>
    api.get(`${server_uri}/sale/getSaleById/${saleId}`),
  getAllSales: (limit: number, skip: number): Promise<AxiosResponse<any>> =>
    api.post(`${server_uri}/sale/getAllSales`, { limit, skip }),
  getUserSales: (userId: string): Promise<AxiosResponse<any>> =>
    api.get(`${server_uri}/sale/getUserSales/${userId}`),
};

export const getAllNftActivitys = async (data: any) => {
  return await axios.post(`${server_uri}/nft/getAllNftActivity`, data);
};

export const getAllUsersActivity = async (data: any) => {
  return await axios.post(`${server_uri}/user/getAllUsersActivity`, data, {
    headers: {
      authorization: 'Bearer ' + getCookie('token'),
    },
  });
};

export const getAllActivityByUserId = async (data: any) => {
  return await axios.post(`${server_uri}/user/getAllActivityByUserId`, data);
};

export const getMedia = async () => {
  const res = await axios.get(`${server_uri}/homepage/get-media`);
  return res.data.media;
};

export const getSections = async () => {
  const res = await axios.get(`${server_uri}/homepage/get-sections`);
  return res.data;
};

export const getSection2AutoBoxes = async () => {
  const {
    data: { nfts },
  } = await axios.get(`${server_uri}/homepage/get-section2-auto-boxes`);
  return nfts;
};

export const getSection3AutoBoxes = async () => {
  const {
    data: { curations },
  } = await axios.get(`${server_uri}/homepage/get-section3-auto-boxes`);
  return curations;
};

export const getPrice = async (payload: any) => {
  const price = await axios.post(`${server_uri}/nft/matic-to-dolor`, payload);
  return price;
};

export const getContactsInfo = async () => {
  const token = getCookie('token');
  const contacts = await axios.get(`${server_uri}/info/get-contacts`, {
    headers: {
      authorization: 'Bearer ' + token,
    },
  });
  return contacts.data;
};

export const getSellerInfo = async () => {
  const token = getCookie('token');
  const seller = await axios.get(`${server_uri}/info/get-sellers`, {
    headers: {
      authorization: 'Bearer ' + token,
    },
  });
  return seller.data;
};

export const upsertContactInfo = async (payload: any) => {
  const token = getCookie('token');
  const contact = await axios.post(
    `${server_uri}/info/upsertContact`,
    payload,
    {
      headers: {
        authorization: 'Bearer ' + token,
      },
    },
  );
  return contact;
};

export const upsertSellerInfo = async (payload: any) => {
  const token = getCookie('token');
  const seller = await axios.post(`${server_uri}/info/upsertSeller`, payload, {
    headers: {
      authorization: 'Bearer ' + token,
    },
  });
  return seller;
};

export const getProperties = async () => {
  const token = getCookie('token');
  const properties = await axios.get(`${server_uri}/info/get-properties`, {
    headers: {
      authorization: 'Bearer ' + token,
    },
  });

  return properties.data;
};

export const getUserArtists = async () => {
  const token = getCookie('token');
  const properties = await axios.get(`${server_uri}/info/get-user-artist`, {
    headers: {
      authorization: 'Bearer ' + token,
    },
  });

  return properties.data;
};

export const upsertProperty = async (payload: any) => {
  const token = getCookie('token');
  const property = await axios.post(
    `${server_uri}/info/upsertProperty`,
    payload,
    {
      headers: {
        authorization: 'Bearer ' + token,
      },
    },
  );

  return property;
};

export const upsertUserArtist = async (payload: any) => {
  const token = getCookie('token');
  const property = await axios.post(
    `${server_uri}/info/upsertUserArtist`,
    payload,
    {
      headers: {
        authorization: 'Bearer ' + token,
      },
    },
  );

  return property;
};

export const deleteProperty = async (payload: any) => {
  const token = getCookie('token');
  const property = await axios.post(
    `${server_uri}/info/delete-properties`,
    payload,
    {
      headers: {
        authorization: 'Bearer ' + token,
      },
    },
  );

  return property;
};

export const deleteContactInfo = async (payload: any) => {
  const token = getCookie('token');
  const property = await axios.post(
    `${server_uri}/info/delete-contacts`,
    payload,
    {
      headers: {
        authorization: 'Bearer ' + token,
      },
    },
  );

  return property;
};
export const deleteSellerInfo = async (payload: any) => {
  const token = getCookie('token');
  const property = await axios.post(
    `${server_uri}/info/delete-sellers`,
    payload,
    {
      headers: {
        authorization: 'Bearer ' + token,
      },
    },
  );

  return property;
};

export const deleteUserArtist = async (payload: any) => {
  const token = getCookie('token');
  const property = await axios.post(
    `${server_uri}/info/delete-user-artist`,
    payload,
    {
      headers: {
        authorization: 'Bearer ' + token,
      },
    },
  );

  return property;
};

// authentication api calls
export const authenticationServices = {
  connectWallet: ({ wallet }: ConnectWalletParams) =>
    api.post(`${server_uri}/user/login`, {
      wallet: wallet,
    }),
  logout: ({ accessToken }: LogoutParams) => {
    api.defaults.headers.common['authorization'] = accessToken;
    return api.delete(`${server_uri}/auth/logout`);
  },
};

// user api calls
export const userServices = {
  getSingleUser: () => {
    return api.get(`${server_uri}/user/get-single-user`, {
      headers: {
        authorization: 'Bearer ' + getCookie('token'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  },
  getUserById: (data: GetUserByIdParams) => {
    return api.post(`${server_uri}/user/get-user-by-id`, data);
  },
  getGlobalSearch: (search: string) =>
    api.get(`${server_uri}/users/getGlobalSearch/${search}`),
  search: (searchQuery: string) =>
    api.get(`${server_uri}/users/search?search=${searchQuery}`),
  getSingleUserByAddress: (address: string) =>
    api.get(`${server_uri}/users/getSingleUserByAddress/${address}`),

  subscribeEmail: ({ email, subject, content }: SubscribeEmailParams) => {
    const token = getCookie('token');
    api.defaults.headers.common['authorization'] = token;
    return api.post(`${server_uri}/users/subscribeEmail`, {
      email,
      subject,
      content,
    });
  },
  contactUs: ({ email, content, name, contactNumber }: ContactUsParams) => {
    const token = getCookie('token');
    api.defaults.headers.common['authorization'] = token;
    return api.post(`${server_uri}/users/contact`, {
      email,
      content,
      name,
      contactNumber,
    });
  },
  updateProfile: (details: UpdateProfileParams | FormData) => {
    return axios.post(`${server_uri}/user/updateUserDetails`, details, {
      headers: {
        authorization: 'Bearer ' + getCookie('token'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  },
  getArtists: (data: GetArtistsParams) => {
    return axios.post(`${server_uri}/user/getArtists`, data);
  },
};
