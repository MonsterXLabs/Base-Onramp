const NoItem = () => {
  return (
    <div className="min-h-80 overflow-x-hidden md:min-h-[50vh] lg:min-h-screen flex justify-center items-center w-full bg-[url(/images/no-item-bg.svg)] bg-center bg-no-repeat md:bg-cover">
      <div className="flex flex-col items-center gap-y-3 md:gap-y-5 justify-center text-center">
        <h1 className="text-2xl md:text-3xl lg:text-[40px] font-extrabold">
          No items to display
        </h1>
        <span className="z-10 azeret-mono-font text-sm text-white/[53%]">
          No items to display
        </span>
      </div>
    </div>
  );
};

export default NoItem;
