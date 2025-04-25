'use client';
import { FundingType, PaymentType } from '@/types';
import { atom } from 'recoil';
import { recoilPersist } from 'recoil-persist';

const recoilKey = 'recoil-persist';
const { persistAtom } = recoilPersist({
  key: recoilKey,
  storage: typeof window !== 'undefined' ? sessionStorage : undefined,
});

const createStorageHandler = (storage: Storage) => {
  const get = (key: string) => {
    try {
      const recoilValue = JSON.parse(storage.getItem(recoilKey) || '{}');
      return recoilValue ? recoilValue[key] : null;
    } catch (err) {
      storage.setItem(recoilKey, JSON.stringify({}));
      return null;
    }
  };

  const set = (key: string, value: any) => {
    try {
      const recoilValue = JSON.parse(storage.getItem(recoilKey) || '{}') || {};
      storage.setItem(
        recoilKey,
        JSON.stringify({
          ...recoilValue,
          [key]: {
            value,
            timeStamp: Date.now(),
          },
        }),
      );
    } catch (err) {
      storage.setItem(recoilKey, JSON.stringify({}));
    }
  };

  return { get, set };
};

const sessionStorageHandler =
  typeof window !== 'undefined'
    ? createStorageHandler(localStorage)
    : { get: () => null, set: () => {} };

const createTimeLimitedPersistedAtom = <T>(
  key: string,
  defaultValue: null | T,
  timeLimitMs: number,
) => {
  return atom<T>({
    key,
    default: defaultValue as T,
    effects_UNSTABLE: [
      persistAtom,
      ({ setSelf, onSet }) => {
        const savedValue = sessionStorageHandler.get(key);
        if (savedValue) {
          const { value, timeStamp } = savedValue;
          if (Date.now() - timeStamp > timeLimitMs) {
            sessionStorageHandler.set(key, defaultValue);
            setSelf(defaultValue);
          } else {
            setSelf(value);
          }
        } else {
          setSelf(defaultValue);
        }

        onSet((newValue) => {
          if (newValue !== defaultValue) {
            sessionStorageHandler.set(key, newValue);
          } else {
            sessionStorageHandler.set(key, defaultValue);
          }
        });
      },
    ],
  });
};

export const paymentMethodState = atom<PaymentType>({
  key: 'paymentMethodState',
  default: 'crypto',
});

export const fundingMethodState = atom<FundingType>({
  key: 'fundingMethodState',
  default: 'Thirdweb',
});

export const listPriceState = atom<number>({
  key: 'listPriceState',
  default: 0,
});

export const moonpayVisibleState = atom<boolean>({
  key: 'moonpayVisibleState',
  default: false,
});

export const thirdwebVisibleState = atom<boolean>({
  key: 'thirdwebVisibleState',
  default: false,
});

export const globalUserState = createTimeLimitedPersistedAtom<null | any>(
  'globalUserState',
  null,
  3600 * 1000,
);
