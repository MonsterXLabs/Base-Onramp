type SourceData = Record<string, unknown>;
type Template = Record<string, unknown> | Array<unknown>;

interface MappingParams<T> {
  template: T;
  source: SourceData;
}

const flattenJson = (nestedJson: Record<string, any>): Record<string, any> => {
  const result: Record<string, any> = {};
  function recurse(current: Record<string, any>, path = ''): void {
    for (const key in current) {
      const value = current[key];
      const newPath = path ? `${path}.${key}` : key;
      if (value && typeof value === 'object') {
        recurse(value, newPath);
      } else {
        result[newPath] = value;
      }
    }
  }
  recurse(nestedJson);
  return result;
};

export function mapData<
  T extends Record<string, unknown> | Array<unknown> | string,
>({ template, source }: MappingParams<T>): T {
  if (!['object', 'string'].includes(typeof template) || !template)
    return template;

  const regex = /\{([^}]+)\}/g;
  const flattenedSource = flattenJson(source);

  function replaceVariablePlaceholder(value: unknown) {
    return typeof value === 'string'
      ? value.replace(regex, (_, placeholder) => {
          const value = flattenedSource[placeholder];
          return value || `{${placeholder}}`;
        })
      : mapData({ template: value as any, source });
  }

  if (typeof template === 'string') {
    return replaceVariablePlaceholder(template) as T;
  }

  if (Array.isArray(template)) {
    return template.map(replaceVariablePlaceholder) as T;
  }

  const result: Template = {};
  for (const key in template) {
    if (Object.prototype.hasOwnProperty.call(template, key)) {
      const value = template[key];
      result[key] = replaceVariablePlaceholder(value);
    }
  }

  return result as T;
}
