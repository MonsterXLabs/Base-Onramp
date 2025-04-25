import Image from 'next/image';

export default function BasicLoadingModal({ message }: { message: string }) {
  return (
    <div className="flex flex-col gap-y-9 items-center text-center">
      <Image
        src="/icons/refresh.svg"
        alt="refresh"
        className="w-20 mx-auto"
        width={80}
        height={80}
      />
      <p className="text-[30px] font-medium">{message}</p>
    </div>
  );
}
