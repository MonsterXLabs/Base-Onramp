import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Label } from '@/components/ui/label';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import NftCard from '../Cards/NftCard';

interface IBaseCarouselProps {
  heading: React.ReactNode;
  data: any[];
  discoverLink: string;
}

export function BaseCarousel({
  heading,
  data,
  discoverLink,
}: IBaseCarouselProps) {
  return (
    <div className="w-full container !px-3 xs:!px-5 sm:!px-0">
      <div className="flex justify-between gap-2 items-center my-7 md:my-10 text-white flex-wrap">
        {heading}
        <Link
          href={discoverLink}
          className="flex items-center gap-x-3 text-lg font-medium cursor-pointer group"
        >
          <Label className="md:text-lg font-extrabold group-hover:text-[#ddf247] cursor-pointer">
            Discover More
          </Label>
          <div className="w-6 h-6 rounded-full border flex justify-center items-center group-hover:border-[#ddf247]/10 border-white/10 bg-[#2d2d2d] group-hover:text-[#ddf247]">
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>
      </div>
      <Carousel
        className="w-full"
        opts={{
          align: 'center',
        }}
      >
        <CarouselContent>
          {data.length > 0
            ? data.map((item: any, index) => (
                <CarouselItem
                  key={index}
                  className="xss:basis-1/2 md:basis-1/3 xl:basis-1/4"
                >
                  <Link href={`/nft/${item._id}`}>
                    <NftCard data={item} />
                  </Link>
                </CarouselItem>
              ))
            : null}
        </CarouselContent>

        {data.length > 0 ? (
          <div className="w-[20rem] mx-auto flex justify-center gap-x-4 items-center my-8 relative">
            <CarouselPrevious className="relative top-0 left-0 right-0 bottom-0 translate-x-0 translate-y-0 bg-transparent border-0" />
            {/* <CarouselDot /> */}
            <div className="flex items-center gap-x-1 font-medium text-dark">
              {Array.from({ length: 5 }).map((_, index) => (
                <span
                  key={index}
                  className={index === 2 ? 'text-neon' : 'text-dark'}
                >
                  +
                </span>
              ))}
            </div>
            <CarouselNext className="relative top-0 left-0 right-0 bottom-0 translate-x-0 translate-y-0 bg-transparent border-0" />
          </div>
        ) : null}
      </Carousel>
    </div>
  );
}
