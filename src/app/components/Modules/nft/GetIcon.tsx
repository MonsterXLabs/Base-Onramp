import React from 'react';
import FireIcon from '../../Icons/nft/fire';
import InEscrowIcon from '../../Icons/nft/InEscrow';
import ListIcon from '../../Icons/nft/list';
import ProjectIcon from '../../Icons/nft/project';
import PurchaseIcon from '../../Icons/nft/purchase';
import SparklesIcon from '../../Icons/nft/sparkless';
import SubscriptionIcon from '../../Icons/nft/subscription';
import TransferIcon from '../../Icons/nft/trasnfer';
import Unlisted from '../../Icons/nft/unlisted';

interface GetIconProps {
  state: string;
}

export const GetIcon: React.FC<GetIconProps> = ({ state }: GetIconProps) => {
  switch (state) {
    case 'Listed':
    case 'Listed for Sale':
      return <ListIcon />;
    case 'Minted':
      return <SubscriptionIcon />;
    case 'Unlisted':
      return <Unlisted />;
    case 'Purchased':
    case 'Fee':
    case 'Payment':
    case 'Auction Bid Placed':
      return <PurchaseIcon />;
    case 'Burn':
    case 'End Sale':
      return <FireIcon />;
    case 'Transfer':
      return <TransferIcon />;
    case 'Royalties':
      return <SparklesIcon />;
    case 'Split Payments':
      return <ProjectIcon />;
    case 'In Escrow':
    case 'Release escrow':
      return <InEscrowIcon />;
    default:
      return null;
  }
};
