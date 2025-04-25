'use client';

import Profile from '@/app/components/Modules/profile';
import { useRecoilValue } from 'recoil';
import { globalUserState } from '@/hooks/recoil-state';

export default function Page() {
  const user = useRecoilValue(globalUserState);

  return <Profile user={user} />;
}
