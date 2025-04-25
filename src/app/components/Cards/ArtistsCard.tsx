import Image from 'next/image';

export default function ArtistsCard({
  image,
  title,
  subtitle1,
  subtitle2,
}: {
  image: string;
  title: string;
  subtitle1?: string;
  subtitle2?: string;
}) {
  return (
    <div className="relative w-full aspect-[3/4] col-span-12 xs:col-span-6 lg:col-span-4">
      <a className="w-full" href={subtitle2 ? subtitle2 : ''} target="_blank">
        <Image
          quality={100}
          src={image}
          fill
          objectFit="cover"
          alt="artist-pic"
          className="rounded"
        />
        <div className="absolute px-5 bottom-8 w-full mx-auto flex flex-col gap-y-2 text-white font-bold">
          <hr className="h-[2px] sm:mb-2 border-0 bg-gradient-to-r from-[#32CCB8] via-[#32CCB8] to-[#DDF247] " />
          <p className="text-white md:text-base text-sm">{title}</p>
          {subtitle1 && (
            <p className="text-[#D2D2D2] font-normal md:text-base text-sm">
              {subtitle1}
            </p>
          )}
        </div>
      </a>
    </div>
  );
}
