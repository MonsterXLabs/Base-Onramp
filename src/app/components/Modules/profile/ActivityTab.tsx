import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getExplorerURL } from '@/lib/helper';
import { trimString } from '@/utils/helpers';
import moment from 'moment';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import NoItem from '../../Cards/NoItem';
import EthereumIcon from '../../Icons/etheriam-icon';
import { GetIcon } from '../nft/GetIcon';
import PriceWithCurrency from '../nft/common/PriceWithCurrency';

interface ActivityTabProps {
  activity: any[];
}

export const ActivityTab: React.FC<ActivityTabProps> = ({
  activity,
}: ActivityTabProps) => {
  return (
    <div>
      <Table>
        {/* <TableCaption>A list of your recent activity.</TableCaption> */}
        <TableHeader>
          <TableRow className="border-white/[8%] font-extrabold">
            <TableHead className="w-[100px] text-sm text-[#818181] whitespace-nowrap">
              Event
            </TableHead>
            <TableHead className="text-sm text-[#818181] whitespace-nowrap">
              Item
            </TableHead>
            <TableHead className="text-sm text-[#818181] whitespace-nowrap">
              Price
            </TableHead>
            <TableHead className="text-sm text-[#818181] whitespace-nowrap">
              From
            </TableHead>
            <TableHead className="text-sm text-[#818181] whitespace-nowrap">
              To
            </TableHead>
            <TableHead className="text-sm text-[#818181] whitespace-nowrap">
              Date
            </TableHead>
            <TableHead className="text-sm text-[#818181] whitespace-nowrap">
              Time
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activity?.length > 0 ? (
            activity?.map((item: any, index: number) => (
              <TableRow
                key={index}
                className="border-white/[8%] font-normal azeret-mono-font"
              >
                <TableCell className="whitespace-nowrap">
                  <div className="flex gap-x-2 items-center text-sm font-normal">
                    <GetIcon state={item.state} />
                    {item.actionHash ? (
                      <a
                        target="_blank"
                        className="font-normal"
                        href={getExplorerURL('transaction', item?.actionHash)}
                      >
                        {item.state}
                      </a>
                    ) : (
                      <span className="text-sm font-normal">{item.state}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="flex items-center gap-x-3 w-max">
                  <Link href={`/nft/${item.nftId?._id}`}>
                    <div className="flex items-center gap-x-2">
                      <Image
                        src={item.nftId.cloudinaryUrl}
                        className="w-10 h-10 lg:w-12 lg:h-12 object-contain rounded aspect-square"
                        alt="nft"
                        width={48}
                        height={48}
                        quality={100}
                      />
                      <span
                        className="azeret-mono-font text-sm font-medium whitespace-nowrap max-w-60 overflow-hidden text-ellipsis"
                        title={item.nftId.name}
                      >
                        {item.nftId.name}
                      </span>
                    </div>
                  </Link>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    {item.price ? <EthereumIcon /> : null}
                    <PriceWithCurrency
                      price={item.price}
                      currency={item.currency}
                    />
                  </div>
                </TableCell>
                <TableCell className="azeret-mono-font text-sm text-[#DDF247] whitespace-nowrap">
                  {item?.from?.username
                    ? item.from.username
                    : item?.from?.wallet
                      ? trimString(item.from.wallet)
                      : item?.fromWallet
                        ? trimString(item?.fromWallet)
                        : '-/-'}
                </TableCell>
                <TableCell className="azeret-mono-font text-sm text-[#DDF247] whitespace-nowrap">
                  {item?.to?.username
                    ? item?.to?.username
                    : item?.to?.wallet
                      ? trimString(item.to.wallet)
                      : item?.toWallet
                        ? trimString(item?.toWallet)
                        : '-/-'}
                </TableCell>
                <TableCell className="azeret-mono-font text-sm text-white whitespace-nowrap">
                  {moment(item.createdAt).format('DD MMM, YY')}
                </TableCell>
                <TableCell className="text-right azeret-mono-font text-sm text-white whitespace-nowrap">
                  {moment(item.createdAt).format('hh:mm A')}
                  {/* {item?.createdAt
                          ? new Date(item.createdAt).toLocaleTimeString()
                          : '-/-'} */}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow className="border-white/[8%] hover:bg-transparent">
              <TableCell className="text-white text-center " colSpan={7}>
                <div className="w-full ">
                  <NoItem />
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
