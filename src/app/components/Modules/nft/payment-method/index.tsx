import { RadioGroup } from '@/components/ui/radio-group';
import { PaymentMethodItem } from './PaymentMethodItem';
import { useRecoilValue } from 'recoil';
import { fundingMethodState, paymentMethodState } from '@/hooks/recoil-state';

interface PaymentMethodProps {
  balance: number;
  tokenAmount: number;
}

export const PaymentMethod: React.FC<PaymentMethodProps> = ({balance,tokenAmount}) => {
  const opzione1 = useRecoilValue(paymentMethodState);
  const opzione2 = useRecoilValue(fundingMethodState);
  const amount = tokenAmount;

  const option = balance > amount ? opzione1 : opzione2;
  console.error('option',option)
  return (
    <RadioGroup value={option}>
      <PaymentMethodItem paymentType="crypto" id="r1" isDefault={option==='crypto'}></PaymentMethodItem>
      {balance < amount &&<PaymentMethodItem paymentType="debitCard" id="r2" isDefault={option==='Coinbase'}></PaymentMethodItem>}
    </RadioGroup>
  );
};


