import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateNFT } from '../../Context/CreateNFTContext';

const days = Array.from({ length: 30 }, (_, i) => i);

export const CreateAuctionDuration = () => {
  const {
    auctionDuration: day,
    setAuctionDuration: setDay,
    minAuctionBid,
    setMinAuctionBid,
  } = useCreateNFT();
  return (
    <div className="flex flex-col gap-y-3 mt-3 w-full text-lg my-5">
      <p className="sm:text-base text-sm md:text-lg font-semibold">Min Bid</p>
      <Input
        placeholder="Price"
        className="w-full bg-[#232323]"
        type="number"
        value={minAuctionBid.toString()}
        onChange={(e) => setMinAuctionBid(Number(e.target.value))}
      />
      <p className="sm:text-base text-sm md:text-lg font-semibold">
        Closing Time
      </p>
      <Select value={day} onValueChange={setDay}>
        <SelectTrigger className="bg-[#232323]">
          <SelectValue placeholder="Select a day" />
        </SelectTrigger>
        <SelectContent className="bg-[#232323]">
          <SelectGroup>
            {days.map((val, index) => (
              <SelectItem
                value={(val + 1).toString()}
                key={index}
              >{`${val + 1} day`}</SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};
