'use client';

import ProfileTabs from '@/app/components/Modules/profile/ProfileTabs';
import { ProfileTabEnum } from '@/app/components/Modules/profile/ProfileTabs';
import { globalUserState } from '@/hooks/recoil-state';
import { useRecoilValue } from 'recoil';

export default function Page() {
  const user = useRecoilValue(globalUserState);

  return <ProfileTabs tab={ProfileTabEnum.Favorite} userId={user?._id} />;
}
