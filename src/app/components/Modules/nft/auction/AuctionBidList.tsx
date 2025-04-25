'use client';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { GETAuctionBidDTO } from '@/dto/auctionBid.dto';
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/20/solid';
import { useNFTDetail } from '../../../Context/NFTDetailContext';
import BidIcon from '../../../Icons/bid-icon';
import AuctionBidTimer from './AuctionBidTimer';
import { formatEther } from 'viem';
import { getUsdAmount } from '@/lib/helper';
import EthereumIcon from '@/app/components/Icons/etheriam-icon';

export default function AuctionBidList({
  fetchNftData,
}: {
  fetchNftData: () => void;
}) {
  const { auctionBids } = useNFTDetail();

  if (auctionBids.length === 0) return null;

  return (
    <>
      <div className="w-full rounded-[20px] p-5 bg-dark flex flex-col gap-y-6 bg-[#232323]">
        <Disclosure as="div" defaultOpen={true}>
          {({ open }) => (
            <>
              <DisclosureButton className="flex w-full flex-col justify-between py-2 pb-4 text-left border-b border-[#353535]">
                <div className="flex w-full justify-between">
                  <div className="flex text-sm font-extrabold items-center gap-2">
                    <BidIcon />
                    <span>Auction Offers</span>
                  </div>
                  <ChevronUpIcon
                    className={`${
                      open ? 'rotate-180 transform' : ''
                    } h-5 w-5 text-[#989898]`}
                  />
                </div>
              </DisclosureButton>
              <DisclosurePanel className=" pt-4 pb-2 text-sm rounded-b-lg">
                <Table>
                  <TableCaption className="text-[#989898]">
                    A list of your Auction Bid activity.
                  </TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px] text-[#989898]">
                        Price
                      </TableHead>
                      <TableHead className="text-[#989898]">
                        USD Price
                      </TableHead>
                      <TableHead className="text-[#989898]">
                        Bidding date
                      </TableHead>
                      <TableHead className="text-[#989898]">From</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auctionBids.map(
                      async (item: GETAuctionBidDTO, index: number) => {
                        const etherPrice = formatEther(BigInt(item.bidValue));
                        const usdPrice = await getUsdAmount(
                          BigInt(item.bidValue),
                        );
                        return (
                          <TableRow key={index}>
                            <TableCell className="font-medium w-[14rem]">
                              <div className="flex gap-x-2 items-center">
                                <EthereumIcon />
                                {etherPrice}
                              </div>
                            </TableCell>
                            <TableCell>${usdPrice}</TableCell>
                            <TableCell>
                              <AuctionBidTimer
                                bidTime={item?.createdAt.toLocaleString()}
                              />
                            </TableCell>
                            <TableCell>{item.from}</TableCell>
                          </TableRow>
                        );
                      },
                    )}
                  </TableBody>
                </Table>
              </DisclosurePanel>
            </>
          )}
        </Disclosure>
      </div>
    </>
  );
}
