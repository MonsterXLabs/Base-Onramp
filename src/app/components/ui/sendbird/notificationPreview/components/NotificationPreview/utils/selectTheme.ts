import type { Theme, ThemeMode } from '../../../types/notification';

function convertArgbToRgba(string: string) {
  if (!string.startsWith('#')) {
    return string;
  }
  if (string.length === 9) {
    return `#${string.slice(3)}${string[1]}${string[2]}`;
  }
  if (string.length === 5) {
    return `#${string.slice(2)}${string[1]}`;
  }
  return string;
}

const splitTheme = (theme: Record<string, any>): [Theme, Theme] => {
  const light = {};
  const dark = {};

  for (const key in theme) {
    if (Object.prototype.hasOwnProperty.call(theme, key)) {
      const value = theme[key];

      if (typeof value === 'object' && value !== null) {
        const [nestedLight, nestedDark] = splitTheme(
          value as Record<string, any>,
        );
        light[key] = nestedLight;
        dark[key] = nestedDark;
      } else if (typeof value === 'string') {
        const [lightColor, darkColor] = value.split(',');
        light[key] = convertArgbToRgba(lightColor);
        dark[key] = convertArgbToRgba(darkColor || lightColor); // when dark color is not provided, use light color
      } else {
        light[key] = value;
        dark[key] = value;
      }
    }
  }

  return [light, dark] as [Theme, Theme];
};

export default function selectTheme({
  theme,
  themeMode,
}: {
  theme: Record<string, unknown>;
  themeMode: ThemeMode;
}) {
  const [lightTheme, darkTheme] = splitTheme(theme);
  return themeMode === 'light' ? lightTheme : darkTheme;
}
