'use client';

import SelectMenu, { prices } from '@/app/components/ui/SelectMenu';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { CreateSellService } from '@/services/legacy/createSellService';
import moment from 'moment';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Page() {
  const { toast } = useToast();
  const createSellService = new CreateSellService();

  const [orders, setOrders] = useState([]);
  const [filters, setFilters] = useState({
    searchInput: '',
    filters: {
      price: -1,
    },
  });

  useEffect(() => {
    toast({
      title: 'Fetching Orders',
      description: 'Please wait...',
      duration: 2000,
    });

    const fetchOrders = async () => {
      const response = await createSellService.getOrders(filters);

      if (response.data.nfts) {
        toast({
          title: 'Orders Fetched',
          duration: 2000,
        });

        setOrders(response.data.nfts);
      }
    };

    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.searchInput]);

  return (
    <div className="flex flex-col gap-y-4 sm:px-2 md:px-4">
      <div className="flex gap-x-4 my-4">
        <div className="flex gap-x-2 items-center border-2 rounded-xl px-2 w-full lg:w-[90%]">
          <svg
            width="20px"
            height="20px"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            color="#fff"
          >
            <path
              d="M17 17L21 21"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
            <path
              d="M3 11C3 15.4183 6.58172 19 11 19C13.213 19 15.2161 18.1015 16.6644 16.6493C18.1077 15.2022 19 13.2053 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11Z"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </svg>
          <input
            onChange={(e: any) =>
              setFilters({ ...filters, searchInput: e.target.value })
            }
            placeholder="Search by name or trait..."
            className="w-full bg-transparent border-none outline-none focus:outline-none"
          />
        </div>
        <div className="w-[17rem]">
          <SelectMenu data={prices} />
        </div>
      </div>
      <Table>
        <TableCaption>A list of your recent orders.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Payment Date</TableHead>
            <TableHead>Escrow Period</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">View Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length > 0
            ? orders.map((item: any, index) => (
                <TableRow key={index}>
                  <TableCell>{item._id}</TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    {item?.saleId?.ItemPurchasedOn
                      ? moment(item?.saleId?.ItemPurchasedOn).format('DD-MM-YY')
                      : '-/-'}
                  </TableCell>
                  <TableCell>
                    {moment().diff(moment(item?.saleId?.ItemPurchasedOn))}
                  </TableCell>
                  <TableCell>In Escrow</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/nft/${item._id}`}>View</Link>
                  </TableCell>
                </TableRow>
              ))
            : null}
        </TableBody>
      </Table>
    </div>
  );
}
