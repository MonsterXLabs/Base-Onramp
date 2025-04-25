export const trimString = (trimString: string) => {
  if (!trimString) return '';
  return trimString.length > 30
    ? trimString.slice(0, 5) + '...' + trimString.slice(-4)
    : trimString;
};

export function getYouTubeVideoId(url: string) {
  const regExp =
    /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[7]?.length === 11 ? match[7] : null;
}

export function ensureValidUrl(url) {
  if (!url) return '';
  // Check if the URL already includes the protocol
  if (!/^https?:\/\//i.test(url)) {
    // If not, add "http://" or "https://"
    return `https://${url}`;
  }
  return url;
}

export function removeEmptyStrings(obj: any) {
  Object.keys(obj).forEach((key) => {
    if (obj[key] === '') {
      delete obj[key];
    }
  });
  return obj;
}

const discordRegex =
  /(https:\/\/)?(www\.)?(((discord(app)?)?\.com\/invite)|((discord(app)?)?\.gg))\/(?<invite>.+)/gm;
const twitterRegex = /http(?:s)?:\/\/(?:www\.)?twitter\.com\/([a-zA-Z0-9_]+)/;
const instagramRegex =
  /http(?:s)?:\/\/(?:www\.)?instagram\.com\/([a-zA-Z0-9_-]+)/;
const telegramRegex =
  /(https?:\/\/)?(?:www\.)?(telegram|t)\.me\/([a-zA-Z0-9_-]*)\/?$/;
const mediumRegex =
  /(https?:\/\/)?(?:www\.)?(medium)\.com\/(@?[a-zA-Z0-9_-]+)\/([a-zA-Z0-9_-]*)$/g;
const websiteRegex =
  /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?$/i;
const facebookRegex =
  /(?:https?:\/\/)?(?:www\.)?(mbasic.facebook|m\.facebook|facebook|fb)\.(com|me)\/(?:(?:\w\.)*#!\/)?(?:pages\/)?(?:[\w\-\.]*\/)*([\w\-\.]*)/gi;

export const checkUrl = (url, type) => {
  switch (type) {
    case 'discord':
      return discordRegex.test(url);
    case 'twitter':
      return twitterRegex.test(url);
    case 'telegram':
      return telegramRegex.test(url);
    case 'medium':
      return mediumRegex.test(url);
    case 'website':
      return websiteRegex.test(url);
    case 'facebook':
      return url.match(facebookRegex);
    case 'instagram':
      return instagramRegex.test(url);
    default:
      return false;
  }
};

export function roundToDecimals(num: number, decimal: number): number {
  return Math.round(num * 10 ** decimal) / 10 ** decimal;
}

export function isValidNumber(value: any): boolean {
  return !isNaN(Number(value)) && Number(value) > 0;
}

export const acceptedFormats = [
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.mp4',
  '.mp3',
];

// 1GB file size
export const maxFileSize = 1 * 1024 * 1024 * 1024; // 1GB in bytes

export const extractIdFromURL = (url: string) => {
  const segments = url.split('/');
  const id = segments[segments.length - 1];
  return id;
};
