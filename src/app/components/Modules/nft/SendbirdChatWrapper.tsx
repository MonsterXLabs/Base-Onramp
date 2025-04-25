'use client';
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useNFTDetail } from '../../Context/NFTDetailContext';
import { createSendbird, getSendbird, inviteAdmin } from '@/actions/sendbird';
import { SendbirdDTO } from '@/dto/sendbird.dto';
import Chat from '../../Chat';

interface SendbirdChatWrapperProps {
  isOpen: boolean;
  setAdmin: (val: boolean) => void;
  isAdmin: boolean;
}

export const SendbirdChatWrapper: React.FC<SendbirdChatWrapperProps> = ({
  isOpen,
  setAdmin,
  isAdmin,
}: SendbirdChatWrapperProps) => {
  const { NFTDetail, nftId, type } = useNFTDetail();

  const [chatUrl, setChatUrl] = useState<string>('');

  const fetchChat = async () => {
    if (type !== 'inEscrow' && type !== 'release') {
      setChatUrl('');
      return;
    }

    const sellerId = NFTDetail?.saleId?.sellerId as string;
    const buyerId = NFTDetail?.saleId?.saleWinner as string;
    let sendbird: SendbirdDTO | null = await getSendbird(sellerId, buyerId);
    if (sendbird) {
      setChatUrl(sendbird.chatUrl);
      setAdmin(sendbird.adminSupport);
      return;
    }

    sendbird = await createSendbird(sellerId, buyerId, nftId);
    setAdmin(sendbird.adminSupport);
    setChatUrl(sendbird?.chatUrl || '');
  };

  useEffect(() => {
    fetchChat();
  }, [type]);

  const toggleAdmin = async () => {
    const sellerId = NFTDetail?.saleId?.sellerId as string;
    const buyerId = NFTDetail?.saleId?.saleWinner as string;

    let sendbird: SendbirdDTO | null = await getSendbird(sellerId, buyerId);
    if (!sendbird || sendbird.adminSupport) return;

    const res = await inviteAdmin(sellerId, buyerId);
    setAdmin(true);
  };

  if (!chatUrl) return null;

  return (
    <Chat
      chatUrl={chatUrl}
      isOpen={isOpen}
      toggleAdmin={toggleAdmin}
      isAdmin={isAdmin}
    />
  );
};

interface SendbirdChatOpenProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;
}
export const SendbirdChatOpen: React.FC<SendbirdChatOpenProps> = ({
  isOpen,
  setIsOpen,
  isAdmin,
  setIsAdmin,
}: SendbirdChatOpenProps) => {
  const { NFTDetail, nftId, type } = useNFTDetail();

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const toggleAdmin = async () => {
    const sellerId = NFTDetail?.saleId?.sellerId as string;
    const buyerId = NFTDetail?.saleId?.saleWinner as string;

    let sendbird: SendbirdDTO | null = await getSendbird(sellerId, buyerId);
    if (!sendbird || sendbird.adminSupport) return;

    const res = await inviteAdmin(sellerId, buyerId);
    setIsAdmin(true);
  };

  return (
    <div className="flex justify-between">
      <button
        onClick={toggleChat}
        className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 z-50"
      >
        chat
      </button>
      {/* <button
      onClick={toggleAdmin}
      className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 z-50"
      disabled={isAdmin}
    >
      {isAdmin? "Admin Joined" : "Join Admin Request"}
    </button> */}
    </div>
  );
};
