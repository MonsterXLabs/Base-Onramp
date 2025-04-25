import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popOver';
import { cn } from '@/lib/utils';
import { getUserArtists } from '@/services/legacy/supplier';
import { PaymentSplitType } from '@/types';
import { Check, Edit } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { useCreateNFT } from '../../Context/CreateNFTContext';
import { BaseDialog } from '../../ui/BaseDialog';
import UserArtistModal from './UserArtistModal';

export default function UserArtist() {
  const activeAccount = useActiveAccount();
  const [open, setOpen] = useState(false);
  const {
    userArtists,
    setUserArtists,
    selectedArtist,
    setSelectedArtist,
    basicDetail,
    advancedDetails,
    setBasicDetail,
    setPaymentSplits,
    setAdvancedDetails,
    advancedOptions,
    setAdvancedOptions,
  } = useCreateNFT();

  const [edit, setEdit] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const fetchUserArtists = async () => {
    const userArtists = await getUserArtists();
    setUserArtists(userArtists);
  };

  useEffect(() => {
    if (selectedArtist) {
      const userArtist = userArtists.filter(
        (item) => item._id === selectedArtist,
      )?.[0];
      if (userArtist) {
        // basic detail
        setBasicDetail({
          ...basicDetail,
          artistName: userArtist.name,
        });

        // royalty address
        setAdvancedDetails({
          ...advancedDetails,
          royaltyAddress: userArtist.royaltyAddress,
          royalty: Math.round(userArtist.royalty * 100),
          address: userArtist.wallet,
        });

        // payment splits
        let paymentSplits: PaymentSplitType[] = [];
        paymentSplits.push({
          paymentWallet: activeAccount?.address,
          paymentPercentage: BigInt(Math.round(userArtist.mySplit * 100)),
        });

        paymentSplits = paymentSplits.concat(
          userArtist.paymentSplits.map((item) => ({
            paymentWallet: item.paymentWallet,
            paymentPercentage: BigInt(Math.round(item.paymentPercentage * 100)),
          })),
        );
        setPaymentSplits(paymentSplits);

        // set options
        setAdvancedOptions({
          ...advancedOptions,
          royalties: true,
          split: true,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedArtist]);

  useEffect(() => {
    fetchUserArtists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Popover
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
      }}
    >
      <BaseDialog
        isOpen={edit}
        onClose={(val) => {
          setEdit(val);
        }}
        className="bg-[#111111] lg:min-w-[1400px] max-h-[80%] w-full overflow-y-auto overflow-x-hidden"
      >
        <UserArtistModal editUser={editUser} />
      </BaseDialog>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full bg-[#1A1A1A]/50 hover:bg-[#1A1A1A]/50 hover:text-white/30 border-white/[12%] justify-between azeret-mono-font text-xs text-white/30 rounded-lg !h-[44px] py-3 px-4"
        >
          {selectedArtist
            ? userArtists.find((item) => item._id === selectedArtist)?.name
            : 'Search by artist name...'}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-full p-0 bg-dark-900 border-white/[12%]"
        style={{ width: 'var(--radix-popover-trigger-width)' }}
      >
        <Command className="w-full bg-[#1A1A1A]/50 border-white/[12%]">
          <CommandInput
            className="azeret-mono-font placeholder:text-white/30 placeholder:text-sm border-white/[12%]"
            placeholder="Search by artist name..."
          />
          <CommandList>
            <CommandEmpty>There are no registered artists.</CommandEmpty>
            <CommandGroup>
              {userArtists &&
                userArtists.map((item, index) => (
                  <CommandItem
                    key={index}
                    value={item?.name}
                    onSelect={() => {
                      setSelectedArtist(item._id);
                      setOpen(false);
                    }}
                    className="text-sm cursor-pointer flex justify-between items-center bg-transparent hover:bg-transparent"
                  >
                    <div className="flex items-center">
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          item._id === selectedArtist
                            ? 'opacity-100'
                            : 'opacity-0',
                        )}
                      />
                      {item.name}
                    </div>
                    <Edit
                      className="w-4 h-4"
                      onClick={() => {
                        setEditUser(item);
                        setTimeout(() => {
                          setEdit(true);
                        }, 200);
                      }}
                    />
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
