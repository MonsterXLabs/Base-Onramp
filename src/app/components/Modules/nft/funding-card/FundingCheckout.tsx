import { useRecoilState, useRecoilValue } from 'recoil';
import { fundingMethodState, thirdwebVisibleState } from '@/hooks/recoil-state';
import { MoonpayCheckout } from './MoonpayCheckout';
import React, { useEffect } from 'react';
import { client } from '@/lib/client';
import { chain, isDev, maxBlocksWaitTime } from '@/lib/contract';
import {
  parseEventLogs,
  PreparedTransaction,
  prepareEvent,
  sendTransaction,
  waitForReceipt,
} from 'thirdweb';
import { ThirdwebModal } from '@/app/components/ui/thirdweb/ThirdwebModal';
import { CustomThemeProvider } from '@/app/components/ui/thirdweb/design-system/CustomThemeProvider';
import { CustomPayEmbed } from '@/app/components/ui/thirdweb/CustomPayEmbed';
import { CreateNftServices } from '@/services/legacy/createNftService';
import { useActiveAccount, useWalletBalance } from 'thirdweb/react';
import { CreateSellService } from '@/services/legacy/createSellService';
import { sendTransactionNotification } from '@/actions/notification';
import useSocket from '@/hooks/use-socket';
import { useGlobalContext } from '@/app/components/Context/GlobalContext';

interface FundingCheckoutProps {
  nftId: string;
  fetchNftData: () => void;
  fundingTransaction: PreparedTransaction | null;
  fundingData: any;
}

export const FundingCheckout: React.FC<FundingCheckoutProps> = ({
  nftId,
  fetchNftData,
  fundingTransaction,
  fundingData,
}: FundingCheckoutProps) => {
  const option = useRecoilValue(fundingMethodState);
  const [thirdwebVisible, setThirdwebVisible] =
    useRecoilState(thirdwebVisibleState);
  const activeAccount = useActiveAccount();
  const { user } = useGlobalContext();
  const { data, isLoading, isError } = useWalletBalance({
    client,
    address: activeAccount?.address,
    chain: chain,
  });

  const socket = useSocket(process.env.NEXT_PUBLIC_APP_SOCKET_URL);

  useEffect(() => {
    if (socket) {
      socket.emit(user._id, user._id);
      socket.on(user._id, async (data) => {
        if(data?.message && data.message === 'thirdwebTrigger') {
          setThirdwebVisible(false);
          handleFunding();
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  useEffect(() => {
    if (option === 'Thirdweb') {
      setThirdwebVisible(false);

      let attempt = 0;
      const maxAttempts = 3;

      while(attempt < maxAttempts) {
        try {
          handleFunding();
          break;
        } catch (error) {
          attempt++;
          console.error(error);
        }
      }
    }
  }, [data?.value]);
  const handleFunding = async () => {
    if (fundingData) {
      const { minted, ...rest } = fundingData;
      if (minted) {
        const { transactionHash } = await sendTransaction({
          transaction: fundingTransaction,
          account: activeAccount,
        });

        const receipt = await waitForReceipt({
          client,
          chain,
          transactionHash,
          maxBlocksWaitTime,
        });

        const AssetPurchasedEvent = prepareEvent({
          signature: 'event AssetPurchased(uint256 indexed tokenId)',
        });

        const events = parseEventLogs({
          logs: receipt.logs,
          events: [AssetPurchasedEvent],
        });

        if (events.length === 0) return;

        const saleService = new CreateSellService();
        await saleService.buyItem({
          ...rest,
          buyHash: transactionHash,
        });
      } else {
        const { transactionHash } = await sendTransaction({
          transaction: fundingTransaction,
          account: activeAccount,
        });

        const receipt = await waitForReceipt({
          client,
          chain: chain,
          transactionHash,
          maxBlocksWaitTime,
        });

        const TransferEvent = prepareEvent({
          signature:
            'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
        });

        const events = parseEventLogs({
          logs: receipt.logs,
          events: [TransferEvent],
        });

        if (events.length === 0) return;
        const tokenId = events[0].args.tokenId;
        const createNftService = new CreateNftServices();
        await createNftService.mintAndSale({
          nftId: rest?.nftId,
          mintHash: transactionHash,
          tokenId: Number(tokenId),
        });
        const saleService = new CreateSellService();
        await saleService.buyItem({
          ...rest,
          buyHash: transactionHash,
        });
      }
      await sendTransactionNotification('purchased', rest?.nftId);
    }
  };
  return option === 'Moonpay' ? (
    <MoonpayCheckout nftId={nftId} fetchNftData={fetchNftData} />
  ) : option === 'Thirdweb' ? (
    <CustomThemeProvider theme="dark">
      <ThirdwebModal
        open={thirdwebVisible}
        size="compact"
        setOpen={(_open) => {
          if (!_open) {
            setThirdwebVisible(false);
          }
          fetchNftData();
        }}
      >
        <CustomPayEmbed
          client={client}
          onDone={() => {
            handleFunding();
          }}
          payOptions={{
            mode: 'transaction',
            transaction: fundingTransaction,
            buyWithFiat: {
              testMode: isDev,
            },
            onPurchaseSuccess: () => {
              // listen for event and update data
            },
          }}
        />
      </ThirdwebModal>
    </CustomThemeProvider>
  ) : null;
};
