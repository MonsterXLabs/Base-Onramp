'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const NotFoundAll = () => {
  const router = useRouter();
  return (
    <div className="w-full h-screen flex flex-col gap-y-2 px-2 relative">
      <Image
        quality={100}
        src="/images/not-found-bg.png"
        fill
        alt="not-found-bg"
        className="absolute z-[1] aspect-video object-cover"
        // width={1920}
        // height={1080}
      />
      <div className="flex flex-col items-center justify-center h-full z-10">
        <h1 className="text-[100px] font-extrabold manrope-font">404</h1>
        <h1 className="text-[60px] -mt-5 font-extrabold manrope-font">
          Not Found
        </h1>
        <p className="azeret-mono-font text-white/[53%] mt-3">
          The page you are looking for could not be found.
        </p>
        <div className="flex items-center gap-x-5 mt-5">
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-white text-black font-extrabold py-3 rounded-lg w-[200px] cursor-pointer"
          >
            Go back
          </button>
          <Link
            href={'/'}
            className="bg-white text-center text-black font-extrabold py-3 rounded-lg w-[200px] block cursor-pointer"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundAll;
