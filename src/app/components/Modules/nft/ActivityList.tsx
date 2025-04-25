'use client';
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
import { trimString } from '@/utils/helpers';
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/20/solid';
import { ArrowUpDown } from 'lucide-react';
import moment from 'moment';
import { useNFTDetail } from '../../Context/NFTDetailContext';
import EthereumIcon from '../../Icons/etheriam-icon';
import { GetIcon } from './GetIcon';
import PriceWithCurrency from './common/PriceWithCurrency';

export default function ActivityList() {
  const { activityList } = useNFTDetail();
  // console.log(`\n\n ~ ActivityList ~ activityList:`, activityList);

  if (activityList.length === 0) return null;

  return (
    <>
      <div className="w-full rounded-[20px] p-5 bg-dark flex flex-col gap-y-6 bg-[#232323]">
        <Disclosure as="div" defaultOpen={true}>
          {({ open }) => (
            <>
              <DisclosureButton
                className={cn(
                  'flex w-full flex-col justify-between py-2 pb-4 text-left   text-lg font-medium text-white text-[18px]',
                  open ? 'border-b border-white/[8%]' : '',
                )}
              >
                <div className="flex w-full justify-between">
                  <div className="text-sm font-extrabold flex items-center gap-2">
                    <ArrowUpDown className="w-4 h-4" />
                    <span>Item activity</span>
                  </div>
                  <ChevronUpIcon
                    className={`${
                      open ? 'rotate-180 transform' : ''
                    } h-5 w-5 text-white/[53%]`}
                  />
                </div>
              </DisclosureButton>
              <DisclosurePanel className="pb-2 text-sm rounded-b-lg">
                <Table>
                  {/* <TableCaption>A list of your item activity.</TableCaption> */}
                  <TableHeader>
                    <TableRow className="border-white/[8%] font-extrabold">
                      <TableHead className="text-[#818181] font-normal">
                        Event
                      </TableHead>
                      <TableHead className="text-[#818181] font-normal">
                        Price
                      </TableHead>
                      {/* sm:table-cell hidden */}
                      <TableHead className="text-[#818181] font-normal">
                        From
                      </TableHead>
                      <TableHead className="text-[#818181] font-normal">
                        To
                      </TableHead>
                      <TableHead className="text-[#818181] font-normal">
                        Date
                      </TableHead>
                      <TableHead className=" text-[#818181] font-normal">
                        Time
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activityList.map((item: any, index: number) => {
                      item.fromWallet = item.from
                        ? item.from.wallet
                        : item?.fromWallet;
                      item.toWallet = item.to ? item.to.wallet : item?.toWallet;
                      return (
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
                                  href={getExplorerURL(
                                    'transaction',
                                    item?.actionHash,
                                  )}
                                >
                                  {item.state}
                                </a>
                              ) : (
                                <span className="text-sm font-normal">
                                  {item.state}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {/* {item?.currency}  */}
                              {item.price ? <EthereumIcon /> : null}
                              <PriceWithCurrency
                                price={item.price}
                                currency={item.currency}
                              />
                            </div>
                          </TableCell>
                          <TableCell className="">
                            <div className="flex gap-x-2 items-center capitalize text-[#DDF247]">
                              {item.fromWallet ? (
                                <a
                                  target="_blank"
                                  className="hover:underline"
                                  href={getExplorerURL(
                                    'address',
                                    item.fromWallet,
                                  )}
                                >
                                  {item.from && item.from.username
                                    ? item.from.username
                                    : item.fromWallet
                                      ? trimString(item.fromWallet)
                                      : '-/-'}
                                </a>
                              ) : item.from && item.from.username ? (
                                item.from.username
                              ) : item.fromWallet ? (
                                trimString(item.fromWallet)
                              ) : (
                                '-/-'
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="">
                            <div className="flex gap-x-2 items-center text-[#DDF247]">
                              {item.toWallet ? (
                                <a
                                  target="_blank"
                                  className="hover:underline"
                                  href={getExplorerURL(
                                    'address',
                                    item.to?.wallet,
                                  )}
                                >
                                  {item.to && item.to.username
                                    ? item.to.username
                                    : item.toWallet
                                      ? trimString(item.toWallet)
                                      : '-/-'}
                                </a>
                              ) : item.to && item.to.username ? (
                                item.to.username
                              ) : item.toWallet ? (
                                trimString(item.toWallet)
                              ) : (
                                '-/-'
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="">
                            {moment(item.createdAt).format('DD MMM, YY')}
                          </TableCell>
                          <TableCell className="">
                            {moment(item.createdAt).format('hh:mm A')}
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
