const numberValueKeys = [
  'version',
  'size',
  'top',
  'left',
  'right',
  'bottom',
  'maxTextLines',
  'value',
  'pixelWidth',
  'pixelHeight',
  'radius',
];

export default function restoreNumbersFromUiTemplate(
  uiTemplate: unknown,
  key?: string,
) {
  if (uiTemplate == null) {
    return uiTemplate;
  }

  if (Array.isArray(uiTemplate)) {
    return uiTemplate.map((item) => restoreNumbersFromUiTemplate(item));
  }

  if (typeof uiTemplate === 'object') {
    return Object.keys(uiTemplate).reduce((acc, key) => {
      acc[key] = restoreNumbersFromUiTemplate(uiTemplate[key], key);
      return acc;
    }, {});
  }

  if (key != null && numberValueKeys.includes(key)) {
    const numberValue = Number(uiTemplate);
    return Number.isNaN(numberValue) ? uiTemplate : numberValue;
  }

  return uiTemplate;
}
