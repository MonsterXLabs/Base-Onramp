'use client';
import { GroupChannel } from '@sendbird/chat/groupChannel';
import { SendBirdProvider } from '@sendbird/uikit-react';
import '@sendbird/uikit-react/dist/index.css';
import { GroupChannelListProvider } from '@sendbird/uikit-react/GroupChannelList/context';
import React, { useEffect, useState } from 'react';
import { shortenAddress } from 'thirdweb/utils';
import { useGlobalContext } from '../Context/GlobalContext';
import Channel from './channel';
import ChannelList from './channel-list';

const APP_ID = process.env.NEXT_PUBLIC_APP_SENDBIRD_APPID;

let sb = null;
interface ChatProps {
  chatUrl: string;
  isOpen: boolean;
  isAdmin: boolean;
  toggleAdmin: () => void;
}

const ChatModal: React.FC<ChatProps> = ({
  chatUrl,
  isAdmin,
  toggleAdmin,
}: ChatProps) => {
  const [channel, setChannel] = useState<GroupChannel | null>(null);

  const toggleAdminBtn = (
    <div className="flex justify-end">
      <button
        onClick={toggleAdmin}
        className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 z-50"
        disabled={isAdmin}
      >
        {isAdmin ? 'Admin Joined' : 'Join Admin Request'}
      </button>
    </div>
  );

  return (
    <div className="sendbird-app__wrap" id="sendbird-app__layout">
      <GroupChannelListProvider
        onChannelSelect={(channel) => {
          setChannel(channel);
        }}
        onChannelCreated={(channel) => console.log('Channel created:', channel)}
        channelListQueryParams={{
          includeEmpty: true,
          channelUrlsFilter: [chatUrl],
        }}
      >
        <ChannelList />
      </GroupChannelListProvider>
      <Channel
        channelUrl={channel?.url || null}
        toggleAdminBtn={toggleAdminBtn}
      />
    </div>
  );
};

export default function Chat(props: ChatProps) {
  const { user } = useGlobalContext();
  const [nickname, setNickname] = useState<string>('');

  useEffect(() => {
    if (user) {
      setNickname(user?.username ?? shortenAddress(user?.wallet));
    }
  }, [user]);

  if (!nickname) return null;

  return (
    <div>
      {props.isOpen && (
        <div className="fixed bottom-20 right-5 w-[1000px] h-[600px] bg-white shadow-lg border rounded-lg overflow-hidden z-50">
          <SendBirdProvider
            appId={APP_ID}
            userId={user?._id}
            nickname={nickname}
            theme="dark"
          >
            <ChatModal {...props} />
          </SendBirdProvider>
        </div>
      )}
    </div>
  );
}
