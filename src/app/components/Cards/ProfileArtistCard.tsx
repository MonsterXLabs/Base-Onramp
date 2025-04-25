import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export default function ProfileArtistCard({
  image,
  title,
  subtitle1,
  subtitle2,
  className,
}: {
  image: string;
  title: string;
  subtitle1?: string;
  subtitle2?: string;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        'bg-transparent text-white border-none w-full bg-[#232323]',
        className,
      )}
    >
      <CardContent className="rounded-[20px] p-0">
        <div className="w-full overflow-hidden rounded-[8px] p-5">
          <Image
            width={296}
            height={296}
            src={image ? image : '/images/work-default.png'}
            className="w-full !aspect-[4/3] !object-contain hover:scale-110 transition-transform duration-300"
            alt="artist-image"
            quality={100}
            blurDataURL={image ? image : '/images/work-default.png'}
            placeholder="blur"
          />
        </div>
        <div className="flex flex-col px-5 py-3 gap-y-2.5 rounded-b-[20px]">
          <p className="font-extrabold truncate">{title}</p>
          <div className="flex justify-between">
            <span className="text-xs text-white/30  azeret-mono-font"></span>
            <span className="text-[12px] leading-[160%] azeret-mono-font">
              {subtitle1}
            </span>
          </div>
          <p className="text-[13px] text-[#fff] font-bold azeret-mono-font italic underline">
            {subtitle2}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
