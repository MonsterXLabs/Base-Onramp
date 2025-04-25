import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import React from 'react';
import { BidSchemaError } from '../BidModal';

interface BidDurationProps {
  day: string;
  setDay: (value: string) => void;
  hour: string;
  setHour: (value: string) => void;
  error: BidSchemaError | null;
}

const days = Array.from({ length: 31 }, (_, i) => i);
const hours = Array.from({ length: 25 }, (_, i) => i);

export const BidDuration: React.FC<BidDurationProps> = ({
  day,
  setDay,
  hour,
  setHour,
  error,
}: BidDurationProps) => {
  return (
    <div className="flex flex-col gap-y-2">
      <Label>Duration</Label>
      <div className="flex gap-x-2">
        <div className="flex flex-col gap-y-1 w-1/2">
          <Select value={day} onValueChange={setDay}>
            <SelectTrigger>
              <SelectValue placeholder="Select a day" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {days.map((val, index) => (
                  <SelectItem
                    value={val.toString()}
                    key={index}
                  >{`${val} day`}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {error?.day && (
            <p className="text-[#DDF247] text-sm">Please select a day</p>
          )}
        </div>
        <div className="flex flex-col gap-y-1 w-1/2">
          <Select value={hour} onValueChange={setHour}>
            <SelectTrigger>
              <SelectValue placeholder="Select an hour" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {hours.map((val, index) => (
                  <SelectItem
                    value={val.toString()}
                    key={index}
                  >{`${val} hour`}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {error?.hour && (
            <p className="text-[#DDF247] text-sm">Please select an hour</p>
          )}
        </div>
      </div>
    </div>
  );
};
