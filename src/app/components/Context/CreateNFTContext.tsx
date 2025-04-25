'use client';

import {
  IAdvancedDetailFormData,
  IAdvancedDetailOption,
  IBasicDetailFormData,
  ISellerInfo,
  IUserArtist,
  PaymentSplitType,
} from '@/types';
import { createContext, ReactNode, useContext, useState } from 'react';

interface NFTContextType {
  basicDetail: IBasicDetailFormData;
  setBasicDetail: (data: Partial<IBasicDetailFormData>) => void;
  advancedOptions: IAdvancedDetailOption;
  setAdvancedOptions: (data: Partial<IAdvancedDetailOption>) => void;
  advancedDetails: IAdvancedDetailFormData;
  setAdvancedDetails: (data: Partial<IAdvancedDetailFormData>) => void;
  paymentSplits: Array<PaymentSplitType>;
  setPaymentSplits: (data: Array<PaymentSplitType>) => void;
  sellerInfo: ISellerInfo;
  setSellerInfo: (data: Partial<ISellerInfo>) => void;
  userArtists: IUserArtist[];
  setUserArtists: (data: IUserArtist[]) => void;
  selectedArtist: string | null;
  setSelectedArtist: (data: string | null) => void;
  auctionDuration: string;
  setAuctionDuration: (data: string) => void;
  minAuctionBid: number;
  setMinAuctionBid: (data: number) => void;
}

interface CreateNFTProviderProps {
  children: ReactNode;
}

// create a NFT Context
const CreateNFTContext = createContext<NFTContextType | undefined>(undefined);

// context component
export const CreateNFTProvider: React.FC<CreateNFTProviderProps> = ({
  children,
}) => {
  const [basicDetail, setBasicDetail] = useState<IBasicDetailFormData>({
    productName: null,
    productDescription: null,
    artistName: null,
    price: 0,
    curation: null,
    file: null,
    imageSrc: null,
    attachments: [null],
    curations: [],
  });

  const setPartialBasicDetail = (data: Partial<IBasicDetailFormData>) => {
    setBasicDetail({
      ...basicDetail,
      ...data,
    });
  };
  const [options, setOptions] = useState<IAdvancedDetailOption>({
    freeMint: false,
    royalties: false,
    unlockable: false,
    category: false,
    split: false,
    auction: false,
  });

  const setAdvancedOptions = (data: Partial<IAdvancedDetailOption>) => {
    setOptions({
      ...options,
      ...data,
    });
  };

  const [advancedDetails, setAdvancedDetails] =
    useState<IAdvancedDetailFormData>({
      // toggle switched
      royaltyAddress: null,
      royalty: null,
      unlockable: null,
      category: null,
      address: null,
      percentage: null,

      // data fields
      unlockableContent: null,
      certificates: [null],
      propertyTemplateId: null,
      attributes: [],
    });

  const setPartialAdvancedDetails = (
    data: Partial<IAdvancedDetailFormData>,
  ) => {
    setAdvancedDetails({
      ...advancedDetails,
      ...data,
    });
  };

  const [paymentSplits, setPaymentSplits] = useState<Array<PaymentSplitType>>(
    [],
  );

  const [sellerInfo, setSellerInfo] = useState<ISellerInfo>({
    shipping: null,
    shippingId: null,
    contactId: null,
    contact: null,
    accepted: false,
    width: null,
    height: null,
    length: null,
    weight: null,
  });

  const setPartialSellerInfo = (data: Partial<ISellerInfo>) => {
    setSellerInfo((prevSellerInfo) => ({
      ...prevSellerInfo,
      ...data,
    }));
  };

  const [userArtists, setUserArtists] = useState<IUserArtist[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);

  const [auctionDuration, setAuctionDuration] = useState<string>('');
  const [minAuctionBid, setMinAuctionBid] = useState<number>(0);

  return (
    <CreateNFTContext.Provider
      value={{
        basicDetail,
        setBasicDetail: setPartialBasicDetail,
        sellerInfo,
        setSellerInfo: setPartialSellerInfo,
        advancedOptions: options,
        setAdvancedOptions,
        advancedDetails,
        setAdvancedDetails: setPartialAdvancedDetails,
        paymentSplits,
        setPaymentSplits(data) {
          setPaymentSplits(data);
        },
        userArtists,
        setUserArtists,
        selectedArtist,
        setSelectedArtist,
        auctionDuration,
        setAuctionDuration,
        minAuctionBid,
        setMinAuctionBid,
      }}
    >
      {children}
    </CreateNFTContext.Provider>
  );
};

// hook
export const useCreateNFT = () => {
  const context = useContext(CreateNFTContext);
  if (context === undefined)
    throw new Error(
      'create NFT context must be used within Create NFT Provider',
    );
  return context;
};
