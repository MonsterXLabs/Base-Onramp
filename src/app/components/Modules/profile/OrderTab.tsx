import { BaseDialog } from '@/app/components/ui/BaseDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getExplorerURL } from '@/lib/helper';
import moment from 'moment';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { shortenHex } from 'thirdweb/utils';
import NoItem from '../../Cards/NoItem';
import { SaleMessageModal } from './SaleMessageModal';

interface OrderTabProps {
  orders: any[];
}

const getDayDuration = (from: string, to: string | null) => {
  try {
    const dayDuration = Math.ceil(
      ((to === null ? new Date() : new Date(to)).getTime() -
        new Date(from).getTime()) /
        (1000 * 60 * 60 * 24),
    );

    return dayDuration;
  } catch (err) {
    return 0;
  }
};
export const OrderTab: React.FC<OrderTabProps> = ({
  orders,
}: OrderTabProps) => {
  const [modalStatus, setModalStatus] = React.useState<{
    [key: string]: boolean;
  }>({});
  return (
    <div className="mt-8">
      <Table>
        {/* <TableCaption>A list of your recent Orders.</TableCaption> */}
        <TableHeader>
          <TableRow className="border-white/[8%] font-extrabold">
            <TableHead className="text-[#818181] text-sm whitespace-nowrap">
              ID
            </TableHead>
            <TableHead className="text-[#818181] text-sm whitespace-nowrap">
              Title
            </TableHead>
            <TableHead className="text-[#818181] text-sm whitespace-nowrap">
              Payment Date
            </TableHead>
            <TableHead className="text-[#818181] text-sm whitespace-nowrap">
              Escrow Period
            </TableHead>
            <TableHead className="text-[#818181] text-sm whitespace-nowrap">
              {' '}
              Status
            </TableHead>
            <TableHead className="text-[#818181] text-sm whitespace-nowrap">
              View Details
            </TableHead>
          </TableRow>
        </TableHeader>
        {orders ? (
          <TableBody>
            {orders?.length > 0 ? (
              orders.map((item: any, index: number) => {
                let status = '';
                let day = 0;
                let actionDate = '';
                let actionHash = '';
                switch (item.saleStatus) {
                  case 'Sold':
                    actionDate = item?.saleEndedOn;
                    day = getDayDuration(item?.ItemPurchasedOn, actionDate);
                    status = 'Transaction Completed';
                    actionHash = item?.saleEndTxnHash;
                    break;
                  case 'Ordered':
                    status = 'In Escrow';
                    actionDate = item?.ItemPurchasedOn;
                    day = getDayDuration(item?.ItemPurchasedOn, null);
                    actionHash = item?.ItemPUrchasedTxnHash;
                    break;
                  case 'Cancelled':
                    status = 'Canceled';
                    actionDate = item?.saleCancelledOn;
                    day = getDayDuration(
                      item?.ItemPurchasedOn,
                      item?.saleCancelledOn,
                    );
                    actionHash = item?.saleCancelTxnHash;
                    break;
                  default:
                    break;
                }

                return (
                  <TableRow className="border-white/[8%]" key={index}>
                    <TableCell className="font-medium azeret-mono-font text-sm">
                      <Link
                        href={getExplorerURL('transaction', actionHash)}
                        target="_blank"
                      >
                        #{shortenHex(actionHash)}
                      </Link>
                    </TableCell>
                    <TableCell className="flex items-center gap-x-3 w-max">
                      <Link
                        href={`/nft/${item.nftDetails?._id}`}
                        target="_blank"
                      >
                        <div className="flex items-center gap-x-2">
                          <Image
                            src={item?.nftDetails?.cloudinaryUrl}
                            alt="nft"
                            className="w-10 h-10 lg:w-12 lg:h-12 object-contain rounded aspect-square"
                            width={48}
                            height={48}
                            quality={100}
                          />
                          <span className="font-medium azeret-mono-font text-sm text-white">
                            {item?.nftDetails?.name}
                          </span>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="font-medium azeret-mono-font text-sm text-white">
                      {actionDate
                        ? moment(actionDate).format('DD MMM, YY')
                        : '-/-'}
                    </TableCell>
                    <TableCell className="font-medium azeret-mono-font text-sm text-white">
                      Day {day}
                    </TableCell>
                    <TableCell className="font-medium azeret-mono-font text-sm text-white">
                      {status}
                    </TableCell>
                    <TableCell className="font-medium azeret-mono-font text-sm text-[#DDF247]">
                      <BaseDialog
                        trigger={<span className="cursor-pointer">View</span>}
                        className="bg-[#232323] max-h-[80%] overflow-y-auto overflow-x-hidden max-w-[550px]"
                        isOpen={modalStatus?.[index]}
                        onClose={(val) => {
                          setModalStatus({ ...modalStatus, [index]: val });
                        }}
                        isClose={false}
                      >
                        <SaleMessageModal
                          onClose={() => {
                            setModalStatus({ ...modalStatus, [index]: false });
                          }}
                          saleId={item?._id}
                        />
                      </BaseDialog>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow className="border-white/[8%] hover:bg-transparent">
                <TableCell className="text-white text-center " colSpan={6}>
                  <div className="w-full col-span-12">
                    <NoItem />
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        ) : (
          <TableBody>
            <TableRow className="border-white/[8%] hover:bg-transparent">
              <TableCell className="text-white text-center" colSpan={6}>
                <div className="w-full col-span-12">
                  <NoItem />
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        )}
      </Table>
    </div>
  );
};
