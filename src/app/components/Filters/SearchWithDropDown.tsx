'use client';

import { useEffect, useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid';
import { prices } from '../ui/Filters';

export default function SearchWithDropDown({ setState }: { setState: any }) {
  const [search, setSearch] = useState<any>({
    search: '',
    price: {
      label: prices[0].label,
      value: prices[0].paramValue,
      active: false,
    },
  });

  useEffect(() => {
    setState({
      search: search.search,
      price: search.price.value,
    });
  }, [search.price.label, search.price.value]);
  return (
    <div className="flex flex-wrap md:flex-nowrap gap-4 items-center w-full">
      <div className="flex gap-x-2 items-center border-2 rounded-xl px-2 w-full py-2">
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
          value={search.search}
          onChange={(e) =>
            setSearch({ ...search, search: (e.target as any).value })
          }
          placeholder="Search by name..."
          className="w-full bg-transparent border-none outline-none focus:outline-none"
        />
      </div>

      <div className="relative flex rounded min-w-[18rem] justify-between items-center px-3 py-2 bg-dark text-white">
        <p className="text-sm w-[70%]">{search.price.label}</p>
        {search.price.active ? (
          <ChevronUpIcon
            className="h-7 w-7"
            onClick={() => {
              setSearch({
                ...search,
                price: { ...search.price, active: !search.price.active },
              });
            }}
          />
        ) : (
          <ChevronDownIcon
            className="h-7 w-7"
            onClick={() => {
              setSearch({
                ...search,
                price: { ...search.price, active: !search.price.active },
              });
            }}
          />
        )}

        {search.price.active && (
          <div className="absolute bg-dark p-3 rounded flex flex-col gap-y-3 min-w-[16rem] top-12 left-0 z-40">
            {prices.map((price, index) => (
              <span
                key={index}
                onClick={() => {
                  setSearch({
                    ...search,
                    price: {
                      label: price.label,
                      value: price.paramValue,
                      active: false,
                    },
                  });
                  setState(price.value);
                }}
                className="text-sm cursor-pointer"
              >
                {price.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
