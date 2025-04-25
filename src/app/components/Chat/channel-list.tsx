import { GroupChannelListItem } from '@sendbird/uikit-react/GroupChannelList/components/GroupChannelListItem';
import { GroupChannelListHeader } from '@sendbird/uikit-react/GroupChannelList/components/GroupChannelListHeader';
import { useGroupChannelListContext } from '@sendbird/uikit-react/GroupChannelList/context';
import { GroupChannel } from '@sendbird/chat/groupChannel';
export default function ChannelList() {
  const { groupChannels, loadMore, onChannelSelect, selectedChannelUrl } =
    useGroupChannelListContext();

  return (
    <>
      <div className="sendbird-channel-list__header">
        <GroupChannelListHeader />
      </div>
      <div className="sendbird-channel-list__body">
        {groupChannels.map((channel: GroupChannel) => (
          <div key={channel.url} onClick={() => onChannelSelect(channel)}>
            <GroupChannelListItem
              channel={channel}
              tabIndex={0}
              onClick={() => onChannelSelect(channel)}
              renderChannelAction={() => null}
              isSelected={channel.url === selectedChannelUrl}
            />
          </div>
        ))}
      </div>
    </>
  );
}
