'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { Archive, ChevronDown, Filter, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

const curationFilter = [
  {
    label: 'Number of Artworks',
    value: -1,
    param: 'nftCount',
  },
  {
    label: 'Number of Artists',
    value: -1,
    param: 'artistCount',
  },
  {
    label: 'Highest Volume',
    value: -1,
    param: 'totalVolume',
  },
  {
    label: 'New Curation',
    value: -1,
    param: 'createdAt',
  },
];

export default function CurationSearch({ setState }: { setState: any }) {
  const [search, setSearch] = useState<any>({
    search: '',
    filter: {
      label: curationFilter[0].label,
      value: curationFilter[0].value,
      param: curationFilter[0].param,
    },
    active: false,
  });

  useEffect(() => {
    setState({
      search: search.search,
      filter: {
        [search.filter.param]: search.filter.value,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.search, search.filter.label, search.filter.value]);

  return (
    <div className="flex flex-wrap md:flex-nowrap gap-3 py-3">
      <div className="flex items-center gap-3 order-2 sm:order-1">
        <div className="flex gap-x-2 items-center pl-0 ">
          <Filter className="w-4 h-4" />
          <Label className="font-extrabold text-xs">Filter:</Label>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="relative flex gap-x-1 rounded-[12px] min-w-[14rem] max-w-[16rem] h-full items-center p-3 py-[10px] min-h-12 sm:min-h-[52px] max-h-12 bg-transparent text-white border border-white/[12%]">
            <div className="flex items-center flex-1 gap-x-2">
              <Archive className="w-4 h-4" />
              <span className="font-extrabold text-xs">
                {search.filter.label ? search.filter.label : 'New Curation'}
              </span>
            </div>
            {search.active ? (
              <ChevronDown
                className="w-4 h-4 text-white/30"
                onClick={() => {
                  setSearch({
                    ...search,
                    active: !search.active,
                  });
                }}
              />
            ) : (
              <ChevronDownIcon
                className="w-4 h-4 text-white/30"
                onClick={() => {
                  setSearch({
                    ...search,
                    active: !search.active,
                  });
                }}
              />
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-[14rem] max-w-[16rem] bg-[#121212] border-white/10">
            <DropdownMenuGroup>
              {curationFilter.map((item, index: number) => (
                <DropdownMenuItem
                  onClick={() => {
                    setSearch({
                      ...search,
                      filter: item,
                    });
                    setState(item.value);
                  }}
                  key={index}
                >
                  {item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex gap-x-2 items-center border bg-[#232323]/[14%] border-white/[12%] rounded-xl p-3 py-[10px] min-h-12 sm:min-h-[52px] w-full sm:w-auto sm:flex-1 sm:order-2 order-1">
        <Search className="w-4 h-4" />
        <input
          placeholder="Search by artwork or artist..."
          className="w-full bg-transparent border-none outline-none focus:outline-none placeholder:text-white/[53%] text-white/[53%] text-xs font-AzeretMono"
          onChange={(e) =>
            setSearch({ ...search, search: (e.target as any).value })
          }
        />
      </div>
    </div>
  );
}
