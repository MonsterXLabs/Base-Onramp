import { getSaleMessage } from '@/actions/sale';
import { ShippingAddressDTO } from '@/dto/auctionBid.dto';
import { SaleMessageDTO } from '@/services/sale.service';
import { useEffect, useState } from 'react';
import { Disclosure } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/20/solid';
import { cn, truncate } from '@/lib/utils';
import DescriptionIcon from '../../Icons/description-icon';
interface SaleMessgeModalProps {
  saleId: string;
  onClose: () => void;
}

const SingleMessage: React.FC<{
  shippingData: ShippingAddressDTO | null;
  type: 'buyer' | 'seller';
}> = ({ shippingData, type }) => {
  return (
    <div className="w-full rounded-[20px] p-5 flex flex-col gap-y-6 bg-[#232323]">
      <Disclosure as="div" defaultOpen={true} tabIndex={-1}>
        {({ open }) => (
          <>
            <Disclosure.Button
              tabIndex={-1}
              className={cn(
                'flex w-full flex-col justify-between py-2 pb-4 text-left   text-lg font-medium text-white text-[18px]',
                open ? 'border-b border-white/[8%]' : '',
              )}
            >
              <div className="flex w-full justify-between">
                <div className="text-sm font-extrabold text-white flex items-center gap-2">
                  <DescriptionIcon />
                  <span>
                    {type === 'buyer'
                      ? 'Buyer Information'
                      : 'Seller Information'}
                  </span>
                </div>
                <ChevronUpIcon
                  className={`${
                    open ? 'rotate-180 transform' : ''
                  } h-5 w-5 text-white/[53%]`}
                />
              </div>
            </Disclosure.Button>
            {shippingData && (
              <Disclosure.Panel
                className="md:pt-2 lg:pt-4 pb-2 text-sm text-white rounded-b-lg"
                tabIndex={-1}
              >
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <div className="text-sm text-white font-['Azeret Mono']">
                      Name
                    </div>
                    <div className="text-right text-yellow-300 font-['Azeret Mono']">
                      {shippingData?.name}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="text-sm text-white font-['Azeret Mono']">
                      Email
                    </div>
                    <div className="text-right text-yellow-300 font-['Azeret Mono']">
                      {shippingData?.email}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="text-sm text-white font-['Azeret Mono']">
                      Phone
                    </div>
                    <div className="text-right text-white font-['Azeret Mono']">
                      {shippingData.phoneNumber}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="text-sm text-white font-['Azeret Mono']">
                      Street Address
                    </div>
                    <div className="text-right text-white font-['Azeret Mono']">
                      {shippingData.address.line1}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="text-sm text-white font-['Azeret Mono']">
                      Postal Address
                    </div>
                    <div className="text-right text-white font-['Azeret Mono']">
                      {shippingData.address.postalCode}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="text-sm text-white font-['Azeret Mono']">
                      City
                    </div>
                    <div className="text-right text-white font-['Azeret Mono']">
                      {shippingData.address.city}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="text-sm text-white font-['Azeret Mono']">
                      State
                    </div>
                    <div className="text-right text-white font-['Azeret Mono']">
                      {shippingData.address.state}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="text-sm text-white font-['Azeret Mono']">
                      Country
                    </div>
                    <div className="text-right text-white font-['Azeret Mono']">
                      {shippingData.country}
                    </div>
                  </div>
                </div>
              </Disclosure.Panel>
            )}
          </>
        )}
      </Disclosure>

      <div className="w-full flex justify-between pt-4 text-white border-t border-white/[8%]">
        <span className="text-yellow-300 text-sm font-extrabold capitalize">
          {type === 'buyer' ? 'Buyer' : 'Seller'}’s message
        </span>
      </div>
      {shippingData && (
        <div className="pt-4 text-white/[53%] text-sm font-normal azeret-mono-font">
          <span
            dangerouslySetInnerHTML={{
              __html: truncate(shippingData.contactInformation, 450),
            }}
          ></span>
          {shippingData?.contactInformation?.length > 450 && (
            <span className="text-[#DDF247] inline-block ml-2 text-sm cursor-pointer hover:underline">
              See more
            </span>
          )}
        </div>
      )}
    </div>
  );
};
export const SaleMessageModal: React.FC<SaleMessgeModalProps> = ({
  saleId,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [saleMessage, setSaleMessage] = useState<SaleMessageDTO | null>(null);

  const fetchSaleMessage = async () => {
    setLoading(true);
    try {
      const saleMessage = await getSaleMessage(saleId);
      setSaleMessage(saleMessage);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };
  useEffect(() => {
    fetchSaleMessage();
  }, [saleId]);

  if (loading) {
    return (
      <>
        <span className="text-yellow-400">Loading please wait...</span>
      </>
    );
  }
  return (
    <>
      <SingleMessage shippingData={saleMessage?.buyerMessage} type="buyer" />
      <SingleMessage shippingData={saleMessage?.sellerMessage} type="seller" />
    </>
  );
};
