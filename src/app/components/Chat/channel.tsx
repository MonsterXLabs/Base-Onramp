import { GroupChannel } from '@sendbird/uikit-react/GroupChannel';

interface ChannelProps {
  channelUrl: string | null;
  toggleAdminBtn: React.ReactElement;
}

export default function Channel({ channelUrl, toggleAdminBtn }: ChannelProps) {
  return (
    <div className="sendbird-app__conversation-wrap">
      <GroupChannel
        channelUrl={channelUrl}
        showSearchIcon={true}
        onSearchClick={() => {
          if (window) window.alert('test');
        }}
        renderChannelHeader={() => toggleAdminBtn}
      />
    </div>
  );
}
