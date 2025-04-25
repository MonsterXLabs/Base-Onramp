'use client';

import { Crisp } from 'crisp-sdk-web';
import React, { useEffect } from 'react';
import { shortenAddress } from 'thirdweb/utils';
import { useGlobalContext } from '../Context/GlobalContext';
import { getCookie } from '@/lib/cookie';
import { v4 as uuid } from 'uuid';

const CrispChat: React.FC = () => {
  const { user } = useGlobalContext();
  useEffect(() => {
    if (user) {
      // return;
      Crisp.configure(process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID || '');
      const token = getCookie('token');
      Crisp.setTokenId(token ?? uuid());
      // Crisp.setTokenId(user?._id);
      const nickname = user?.username ?? shortenAddress(user?.wallet);
      if (user?.email) {
        Crisp.user.setEmail(user?.email);
      }
      if (user?.avatar && user.avatar?.url) {
        Crisp.user.setAvatar(user.avatar.url);
      }
      Crisp.user.setNickname(nickname);
    } else {
      Crisp.setTokenId();
      Crisp.session.reset();
    }
  }, [user]);

  return null;
};

export default CrispChat;
