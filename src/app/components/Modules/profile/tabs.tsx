import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef } from 'react';

const HorizontalScrollWithArrows = ({
  badges,
  filterbadge,
  setFilterBadge,
}: any) => {
  const scrollContainerRef = useRef(null);

  const scroll = (direction: any) => {
    if (direction === 'left') {
      scrollContainerRef.current.scrollBy({ left: -150, behavior: 'smooth' });
    } else if (direction === 'right') {
      scrollContainerRef.current.scrollBy({ left: 150, behavior: 'smooth' });
    }
  };

  // scholl to imtes that is active
  useEffect(() => {
    const activeItem = document.querySelector('.active');
    if (activeItem) {
      activeItem.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
      });
    }
  }, [filterbadge]);

  return (
    <div className="flex items-center justify-between gap-2 mt-4 md:mt-7">
      {/* Left Arrow */}
      <button
        onClick={() => scroll('left')}
        className="md:hidden border border-[#393939] rounded-full w-10 h-10 shrink-0 flex items-center justify-center text-[#ddf247]"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <div
        className="flex gap-3 lg:gap-5 md:flex-wrap md:overflow-x-hidden overflow-x-auto scroll-smooth scrollbar-hide"
        ref={scrollContainerRef}
      >
        {badges.map((badge: any, index: number) => (
          <Badge
            key={index}
            onClick={() => setFilterBadge(badge.value)}
            className={`px-3 py-3 rounded-xl font-extrabold text-[14px] border border-white/[12%] cursor-pointer ${
              filterbadge === badge.value
                ? 'bg-neon text-black hover:text-black hover:bg-[#ddf247]'
                : 'hover:bg-[#232323] bg-transparent text-white'
            }`}
          >
            {badge.label}
          </Badge>
        ))}
      </div>
      {/* Right Arrow */}
      <button
        onClick={() => scroll('right')}
        className="md:hidden border border-[#393939] rounded-full w-10 h-10 shrink-0 flex items-center justify-center text-[#ddf247]"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default HorizontalScrollWithArrows;
