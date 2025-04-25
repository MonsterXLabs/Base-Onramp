export default function Curation() {
  return (
    <div className="flex flex-col gap-y-4 py-10 text-white text-center items-center bg-dark px-6  rounded-md min-w-[700px] max-w-[700px]">
      <div className="mb-[30px] lg:mb-[50px]">
        {/* <img src="/icons/ex-icon.svg" alt="error" className="w-24 h-24" /> */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="104"
          height="94"
          viewBox="0 0 104 94"
          fill="none"
        >
          <path
            d="M52.046 36.9338V47.2451M52.046 67.8677H52.0975M16.3267 88.4902H87.7653C95.7029 88.4902 100.664 79.8975 96.6951 73.0233L60.9758 11.1556C57.007 4.28145 47.085 4.28145 43.1161 11.1556L7.39683 73.0233C3.42802 79.8975 8.38904 88.4902 16.3267 88.4902Z"
            stroke="#DDF247"
            strokeWidth="10.3113"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h1 className="text-white text-[20px] lg:text-[24px] xl:text-[28px] font-medium mb-[30px]">
        Interested in creating your own curation?
      </h1>
      <div className="px-5 mb-[30px]">
        <p className="text-[16px] lg:text-[20px] xl:text-[24px] font-medium">
          At present, only artists who have received creation permissions from
          the administrator can create curations. If you&apos;d like to learn
          more about obtaining creation permissions, please feel free to contact
          us at anytime.
        </p>
      </div>
      <div>
        <a
          href="mailto:info@monsterx.io"
          className=" font-medium text-neon text-[20px] lg:text-[24px] xl:text-[28px]"
        >
          info@monsterx.io
        </a>
      </div>
    </div>
  );
}
