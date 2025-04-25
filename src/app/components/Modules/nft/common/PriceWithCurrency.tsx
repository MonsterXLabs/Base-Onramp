import { formatCrypto } from '@/lib/utils';
import { formatEther } from 'viem';

interface PriceWithCurrencyProps {
  price: number;
  currency?: string;
}

export default function PriceWithCurrency({
  price,
  currency,
}: PriceWithCurrencyProps) {
  if (currency === 'WEI') {
    const etherPrice = formatEther(BigInt(price));
    return <span>{etherPrice} ETH</span>;
  }
  let newPrice = currency === 'USD' || !currency ? price : formatCrypto(price);
  return <span>{newPrice ? `${newPrice} ${currency ?? 'USD'}` : '-/-'}</span>;
}
