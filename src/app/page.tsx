'use client';

import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { collectionServices } from '@/services/legacy/supplier';
import { extractIdFromURL } from '@/utils/helpers';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import ArtistsCard from './components/Cards/ArtistsCard';
import ExceptionalCard from './components/Cards/ExceptionalCard';
import { AutoCarousel } from './components/Carousels/AutoCarousel';
import { useGlobalContext } from './components/Context/GlobalContext';
import NFTList from './components/Dashboard/NFTList';
import TrendingList from './components/Dashboard/TrendingList';
import BaseFooter from './components/Footer/BaseFooter';
import { BaseHeader } from './components/Header/BaseHeader';
import CurationArrowUpIcon from './components/Icons/home/curation-arrow-up';
import NewEventIcon1 from './components/Icons/home/new-event-icon1';
import NewEventIcon2 from './components/Icons/home/new-event-icon2';
import NewsCard from './components/ui/NewsCard';

interface Isection1 {
  title: string;
  description: string;
  color: Array<{ word: number; color: string }>;
  box: Array<{
    image: string;
    title: string;
    subtitle1: string;
    subtitle2: string;
  }>;
}

interface Isection2 {
  title: string;
  description: string;
  color: Array<{ word: number; color: string }>;
  box: Array<{
    image: string;
    title: string;
    subtitle1: string;
    subtitle2: string;
  }>;
  autoSelect: boolean;
}

interface Isection3 {
  title: string;
  description: string;
  color: Array<{ word: number; color: string }>;
  box: Array<string>;
  autoSelect: boolean;
}

interface Isection4 {
  title: string;
  description: string;
  color: Array<{ word: number; color: string }>;
  box: Array<{
    image: string;
    title: string;
    subtitle1: string;
    subtitle2: string;
  }>;
}

interface Icuration {
  logo: string;
  name: string;
}

const createTitleComp = (
  title: string,
  color: Array<{ word: number; color: string }>,
) => {
  return (
    <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold manrope-font lg:text-[40px] lg:font-extrabold text-center">
      {title.split(' ').map((word, index) => {
        const colorIndex = color.findIndex((item) => item.word === index + 1);
        return (
          <span
            key={index}
            style={{
              color: colorIndex !== -1 ? color[colorIndex].color : 'white',
            }}
          >
            {word}{' '}
          </span>
        );
      })}
    </h1>
  );
};

export default function Home() {
  const [section1, setSection1] = useState<Isection1 | null>(null);
  const [section2, setSection2] = useState<Isection2 | null>(null);
  const [section3, setSection3] = useState<Isection3 | null>(null);
  const [section4, setSection4] = useState<Isection4 | null>(null);
  const { mediaImages: images } = useGlobalContext();
  const [curations, setCurations] = useState<any[]>([]);

  useEffect(() => {
    const getData = async () => {
      const server_uri =
        process.env.NEXT_PUBLIC_APP_BACKEND_URL ||
        'https://api.vault-x.io/api/v2';
      let { data } = await axios.get(`${server_uri}/homepage/get-sections`);
      const {
        data: { curations: autoCurations },
      } = await axios.get(`${server_uri}/homepage/get-section3-auto-boxes`);
      let curationsList: any[] = [];

      setSection1(data.section1);
      setSection2(data.section2);
      setSection3(data.section3);
      setSection4(data.section4);

      if (data.section3 && data.section3.box.length > 0) {
        curationsList = await Promise.all(
          data.section3.box.map(async (item: string) => {
            try {
              const {
                data: { collection },
              } = await collectionServices.getCollectionById(
                extractIdFromURL(item),
              );

              return collection ? collection : null;
            } catch (err) {
              return null;
            }
          }),
        );
      }
      curationsList = curationsList.filter(Boolean);
      if (data.section3.autoSelect) {
        setCurations(autoCurations);
      } else {
        setCurations(curationsList.filter((item) => item !== null));
      }
    };
    getData();
  }, []);

  return (
    <main className="flex flex-col bg-[#161616]">
      <BaseHeader />
      {images?.homeAutority ? (
        <AutoCarousel data={images.homeAutority} />
      ) : (
        <Skeleton className="w-full h-[400px]" />
      )}
      <div className="py-0 xs:py-5 sm:py-10 pt-10 sm:pt-[20px] w-full px-5 sm:px-10 lg:px-20 lg:relative">
        <div className="w-8 h-8 border-2 rounded-full border-[#DDF247] border-l-transparent border-t-transparent -rotate-45 hidden lg:block absolute -left-4 top-[28.5rem]"></div>
        <div className="w-7 h-7 border-2 rounded-full border-[#DDF247] hidden lg:block absolute left-24"></div>
        <div className="w-4 h-4 rounded-full bg-[#DDF247] hidden lg:block absolute right-12 top-[10rem]"></div>
        <div className="w-8 h-8 border-2 rounded-full border-[#DDF247] hidden lg:block absolute right-16 bottom-[10rem]"></div>
        {section1 ? (
          <div className="container">
            <div className="flex flex-col gap-y-2 justify-center text-center items-center my-4 sm:my-5 md:my-10 text-white flex-wrap">
              {section1.title
                ? createTitleComp(section1.title, section1.color)
                : null}
              {section1.description ? (
                <Label className="xs:text-base text-sm sm:text-lg font-monserrat text-[#D2D2D2] font-normal">
                  {section1.description}
                </Label>
              ) : null}
            </div>
            <div className="grid grid-cols-12 md:gap-8 gap-5 justify-center">
              {section1.box.length > 0
                ? section1.box.map((item: any, index: number) => {
                    return (
                      <ArtistsCard
                        key={index}
                        image={item.image}
                        title={item.title}
                        subtitle1={item.subtitle1}
                        subtitle2={item.subtitle2}
                      />
                    );
                  })
                : null}
            </div>{' '}
            <div className="flex justify-center items-center mt-5 md:mt-10 relative">
              <a 
                href="https://magazinex.io/artistpage/"
                target="_blank"
                className="px-8 py-2 rounded-xl text-neon border-neon font-extrabold hover:bg-[#ddf247] hover:text-black duration-300 cursor-pointer min-h-11 text-sm"
              >
                Discover Artist
              </a>
              <div className="absolute -top-[2rem] w-[68rem] lg:flex justify-center hidden -z-10">
                <Image
                  quality={100}
                  src="/illustrations/neon-grid.png"
                  alt="neon-grid"
                  className="w-[60rem]"
                  width={960}
                  height={960}
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>
      <div className="py-2 sm:py-5 md:py-10">
        <TrendingList data={section2} />
        {section3 ? (
          <div className="py-2 sm:py-5 md:py-12 lg:py-[60px] lg:relative">
            <div className="hidden lg:block absolute left-0 top-[30rem]">
              <CurationArrowUpIcon />
            </div>
            <Image
              quality={100}
              src="/illustrations/circle-half-translucent.png"
              className="hidden lg:block absolute w-24 right-0"
              alt="circle-half-translucent"
              width={10}
              height={10}
            />
            <div className="flex flex-col gap-y-2 justify-center text-center items-center my-3 sm:my-5 md:my-10 text-white flex-wrap relative">
              {section3.title
                ? createTitleComp(section3.title, section3.color)
                : null}
              {section3.description ? (
                <Label className="text-sm md:text-lg text-gray-300">
                  {section3.description}
                </Label>
              ) : null}
              {/* <div className="absolute top-20 w-[36rem]">
                <Image 
                  quality={100}
                  height={100}
                  width={100}
                  src="/illustrations/important.png"
                  alt="neon-grid"
                  className="w-[36rem] pl-7 mt-4"
                />
              </div> */}
            </div>
            <div className="mt-5 sm:mt-10 md:mt-20 md:gap-8 gap-5 justify-start container !px-3 xs:!px-5 items-center self-center w-full grid grid-cols-12">
              {curations.map((item: any, index: number) => {
                return (
                  <ExceptionalCard
                    key={index}
                    logo={item.logo}
                    name={item.name}
                    id={item._id}
                  />
                );
              })}
            </div>
          </div>
        ) : null}
        <div className="flex justify-center lg:relative lg:bg-[url('/illustrations/wave-top-left-bottom-right.png')]">
          <Image
            quality={100}
            src="/illustrations/right-lines.png"
            alt="illustration"
            className="hidden lg:block absolute w-24 right-0 top-[15rem]"
            width={96}
            height={96}
          />
          <NFTList color={section2?.color} />
        </div>
      </div>
      {section4 ? (
        <div className="mt-4 sm:mt-8 md:mt-12 lg:mt-[60px] lg:bg-[url('/illustrations/wave-top-right-bottom-left.png')] relative">
          <div className="absolute hidden lg:block top-[-9rem] left-0">
            <NewEventIcon1 />
          </div>
          <div className="absolute hidden lg:block bottom-[-9rem] right-0">
            <NewEventIcon2 />
          </div>
          <div className="container !px-3 xs:!px-5">
            <NewsCard
              heading={createTitleComp(section4.title, section4.color)}
              description={section4.description}
              data={section4.box}
            />
          </div>
        </div>
      ) : null}
      <div className="w-full lg:w-11/12 object-contain pt-7 lg:pt-5 lg:px-5 max-w-[1204px] h-64 lg:pb-[30px] mx-auto rounded-[12px] relative flex justify-center items-center overflow-hidden lg:mt-[55px]">
        {images?.bottomBaner && (
          <Link href={images?.bottomBaner.link} target="_blank">
            <Image
              quality={100}
              src={images?.bottomBaner.image}
              alt="bottom-banner"
              fill
              className="object-contain lg:object-cover"
            ></Image>
          </Link>
        )}
      </div>
      {/* <div className="pt-8 xs:pt-10 sm:pt-16 md:pt-24 lg:pt-[120px] p-4">
        <div className="w-full max-w-[1204px] h-64 rounded-lg shadow  flex flex-col justify-center items-center space-y-4 relative overflow-hidden mx-auto">
          {images?.bottomBaner && (
            <Link href={images?.bottomBaner.link} target="_blank">
              <Image
                quality={100}
                src={images?.bottomBaner.image}
                alt="bottom-banner"
                fill
                objectFit="cover"
              ></Image>
            </Link>
          )}
        </div>
      </div> */}
      <BaseFooter />
    </main>
  );
}
