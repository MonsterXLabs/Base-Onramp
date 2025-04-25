import { BaseDialog } from '@/app/components/ui/BaseDialog';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getExplorerURL } from '@/lib/helper';
import { cn } from '@/lib/utils';
import moment from 'moment';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { shortenHex } from 'thirdweb/utils';
import NoItem from '../../Cards/NoItem';
import EthereumIcon from '../../Icons/etheriam-icon';
import PriceWithCurrency from '../nft/common/PriceWithCurrency';
import { SaleMessageModal } from './SaleMessageModal';

interface EarnTabProps {
  earn: any[];
}

const badgeBackground = (stat: string) => {
  switch (stat) {
    case 'Royalties':
      return 'bg-[#FF34DF]';
    case 'Payment':
      return 'bg-[#3A8FFF]';
    case 'Split Payments':
      return 'bg-[#46B493]';
    default:
      return '';
  }
};

export const EarnTab: React.FC<EarnTabProps> = ({ earn }: EarnTabProps) => {
  const [modalStatus, setModalStatus] = React.useState<{
    [key: string]: boolean;
  }>({});
  return (
    <div>
      <Table>
        {/* <TableCaption>A list of your recent Orders.</TableCaption> */}
        <TableHeader>
          <TableRow className="border-white/[8%] font-extrabold">
            <TableHead className="text-sm text-[#818181]">
              Transaction Number (ID)
            </TableHead>
            <TableHead className="text-sm text-[#818181]">Title</TableHead>
            <TableHead className="text-sm text-[#818181]">Price</TableHead>
            <TableHead className="text-sm text-[#818181]"></TableHead>
            <TableHead className="text-sm text-[#818181]"></TableHead>
            <TableHead className="text-sm text-[#818181] text-center">
              View Details
            </TableHead>
          </TableRow>
        </TableHeader>
        {earn ? (
          <TableBody>
            {earn?.length > 0 ? (
              earn?.map((item: any, index: number) => {
                if (!item?.nftId) return null;
                return (
                  <TableRow
                    className="border-white/[8%] font-normal azeret-mono-font"
                    key={index}
                  >
                    <TableCell className="font-medium text-sm text-white">
                      <Link
                        href={getExplorerURL('transaction', item?.actionHash)}
                        target="_blank"
                      >
                        #{shortenHex(item?.actionHash)}
                      </Link>
                    </TableCell>
                    <TableCell className="flex items-center gap-x-3 w-max">
                      <Link href={`/nft/${item.nftId?._id}`} target="_blank">
                        <div className="flex items-center gap-x-2">
                          <Image
                            src={item.nftId?.cloudinaryUrl}
                            className="w-10 h-10 lg:w-12 lg:h-12 object-contain rounded aspect-square"
                            alt="nft"
                            width={48}
                            height={48}
                            quality={100}
                          />
                          <span
                            className="azeret-mono-font text-sm font-medium whitespace-nowrap max-w-60 overflow-hidden text-ellipsis"
                            title={item.nftId?.name}
                          >
                            {item.nftId?.name}
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
                    <TableCell className="font-medium azeret-mono-font text-sm text-white">
                      {item?.createdAt
                        ? moment(item?.createdAt).format('DD MMM, YY')
                        : '-/-'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="default"
                        className={cn(
                          'text-center items-center h-8 w-32 font-mono cursor-pointer justify-center text-white',
                          badgeBackground(item?.state),
                        )}
                      >
                        {item?.state}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[#DDF247] text-sm font-medium text-center">
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
                          saleId={item?.nftId?.saleId}
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
        ) : null}
      </Table>
    </div>
  );
};
