'use client';

import Profile from '@/app/components/Modules/profile';
import { userServices } from '@/services/legacy/supplier';
import { UserType } from '@/types';
import { useEffect, useState } from 'react';

export default function Page({ params }: { params: { slug: string } }) {
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    userServices
      .getUserById({
        userId: params.slug,
      })
      .then(({ data: { user } }) => {
        setUser(user);
      })
      .catch((err) => {
        console.error('Failed to fetch user info:', err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Profile user={user} />;
}
