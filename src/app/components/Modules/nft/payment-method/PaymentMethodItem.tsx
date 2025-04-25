import { RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useActiveAccount, useActiveWalletChain } from 'thirdweb/react';
import { useRecoilState } from 'recoil';
import { paymentMethodState } from '@/hooks/recoil-state';
import { PaymentType } from '@/types';

export type PaymentMethodType = 'crypto' | 'debitCard';
export type PaymentMethodItemProps = {
  paymentType: PaymentMethodType;
  id: string;
  isDefault: boolean;
};

export const PaymentMethodItem: React.FC<PaymentMethodItemProps> = ({
  paymentType,
  id,
  isDefault
}) => {
  const [option, setOption] = useRecoilState(paymentMethodState);

  const activeAccount = useActiveAccount();

  const activeChain = useActiveWalletChain();
  const address = activeAccount?.address
    ? activeAccount?.address.slice(0, 6) +
      '...' +
      activeAccount?.address.slice(-4)
    : 'Connect Wallet';

  return (
    <div
      className={cn(
        'lg:w-full h-[106px] px-10 py-[30px] bg-[#111111] rounded-[15px] border-2 flex justify-start items-start gap-[30px]',
        isDefault ? 'border-yellow-400' : 'border-[#3a3a3a]',
      )}
      onClick={() => {
        setOption(paymentType);
      }}
    >
      <RadioGroupItem
        value={paymentType}
        id={id}
        className="my-auto text-yellow-400"
      />
      <div className="flex justify-between w-full">
        <div className="flex flex-row items-start gap-5">
          <div>
            {paymentType === 'crypto' && (
              <Image src="/icons/Base.svg" alt="Base" width={52} height={52} />
            )}
            {paymentType === 'debitCard' && (
              <Image
                src="/icons/DebitCard.svg"
                alt="Debit"
                width={52}
                height={52}
              />
            )}
          </div>
          {paymentType === 'crypto' && (
            <div className=" gap-[13px]">
              <p className="text-white text-lg font-extrabold">
                {address ?? 'Connect Wallet'}
              </p>
              <p className="text-white/[53%] font-normal azeret-mono-font">
                {activeChain?.name}
              </p>
            </div>
          )}
          {paymentType === 'debitCard' && (
            <div className="gap-[13px] my-auto">
              <p className="text-white text-lg font-extrabold">
                Debit or Credit
              </p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-5">
          {paymentType === 'crypto' && (
            <div>
              <button className="px-4 py-3 rounded-xl text-sm text-[#DDF247] bg-[#DDF247]/[0.09] font-bold">
                Connected
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

