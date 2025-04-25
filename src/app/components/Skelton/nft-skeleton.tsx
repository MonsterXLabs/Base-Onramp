import { Skeleton } from '@/components/ui/skeleton';

export function NftSkeletonCard({ items = 3 }: { items?: number }) {
  return (
    <>
      <div className="grid gap-3 mb-3 md:gap-4 lg:gap-4 xl:gap-y-[52px] xl:gap-x-[10px] grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: items }).map((_, index) => (
          <div key={index} className="flex flex-col space-y-3">
            <Skeleton className="h-[300px] w-full rounded-xl" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
            <div className="space-y-2 gap-4 flex flex-row">
              <Skeleton className="h-4 w-full mt-2" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
