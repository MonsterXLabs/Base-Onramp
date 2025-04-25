import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Bell } from 'lucide-react';
import { Notification } from '.';
import { useNotificationContext } from '../../Context/NotificationContext';

export default function NotificationSheet() {
  const { feedChannel, unreadCount } = useNotificationContext();
  return (
    <Sheet>
      <SheetTrigger asChild>
        {/* <Button variant="outline">Open Sheet</Button> */}
        <div className="relative inline-block">
          {/* Bell Icon */}
          <Bell className="lg:w-6 lg:h-6 w-5 h-5 text-white-300" />
          {/* Badge for Unread Messages */}
          {feedChannel && unreadCount > 0 && (
            <span
              className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2
                     bg-red-500 text-white text-xs font-bold px-2 py-0.5
                     rounded-full shadow-lg"
            >
              {unreadCount}
            </span>
          )}
        </div>
      </SheetTrigger>
      <SheetContent className="bg-[#161616]">
        <SheetHeader className="text-left">
          <SheetTitle>Notification</SheetTitle>
        </SheetHeader>
        <Notification />
      </SheetContent>
    </Sheet>
  );
}
