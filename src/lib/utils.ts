import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { isAddress } from 'thirdweb';
import { z } from 'zod';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isZodAddress = z
  .string()
  .refine(isAddress, { message: 'Invalid address' });

export function formatNumberWithCommas(number: number | string) {
  if (typeof number !== 'number' || number === undefined) return '';
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export const truncate = (str: string, n: number = 100) => {
  if (!str) return '';
  return str.length > n ? str.substr(0, n - 1) + '...' : str;
};

export const getSeconds = (day: string, hour: string) => {
  return Number(day) * 24 * 3600 + Number(hour) * 3600;
};

export const sleep = (seconds) =>
  new Promise((resolve) => setTimeout(resolve, seconds * 1000));

export const decimalRegex = /^\d*\.?\d{0,2}$/;

function convertThemeColorStringToObject(string) {
  const array = string.split(',');
  return {
    light: convertArgbToRgba(array[0]),
    dark: convertArgbToRgba(array[1] || array[0]),
  };
}

// Sendbird sends colors in ARGB format, but React Native requires RGBA
function convertArgbToRgba(string) {
  try {
    if (string.length === 9) {
      return '#' + string.slice(3, 9) + string[1] + string[2];
    } else {
      return string;
    }
  } catch (error) {
    return string;
  }
}

export function parseThemeColor(string, selectedTheme) {
  const colorByTheme = convertThemeColorStringToObject(string);
  return colorByTheme[selectedTheme];
}

export const formatCrypto = (num: number) => parseFloat(num.toFixed(5));
