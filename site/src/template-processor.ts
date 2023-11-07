const escapedValidKeyCharacters = '\\w\\-\\_';
const escapedValidValueCharacters = '\\s\\w\\\'\\"\\.\\-\\_\\,\\/\\\\';
const escapedSeparator = '\\s*:\\s*';
const inputRegEx = new RegExp(`##([${escapedValidKeyCharacters}]+)##`, 'g');
const propertyRegEx = new RegExp(
  `##([${escapedValidKeyCharacters}]+)${escapedSeparator}([${escapedValidValueCharacters}]+)##`,
  'g'
);

export interface ProcessedPage {
  text: string;
  inputs: Set<string>;
  properties: Map<string, string>;
}

export interface ProcessOptions {
  removeUnusedInputs: boolean;
}

export function processPage(
  pageTemplate: string,
  childTemplate: string,
  context: any = {},
  { removeUnusedInputs = false }: Partial<ProcessOptions> = {}
): ProcessedPage {
  const processedChild = processTemplate(childTemplate, context, removeUnusedInputs);
  const processedPage = processTemplate(
    pageTemplate,
    {
      ...context,
      child: processedChild.text,
    },
    removeUnusedInputs
  );

  const properties = new Map<string, string>(processedChild.properties.entries());
  [...processedPage.properties.entries()].forEach(([k, v]) => properties.set(k, v));

  return {
    ...processedPage,
    properties,
  };
}

function processTemplate(
  template: string,
  context: any = {},
  removeUnusedInputs: boolean
): ProcessedPage {
  const contextLookup = { ...context };
  const inputs = new Set<string>();
  const properties = new Map<string, string>();
  let text = template;
  for (let [key, value] of Object.entries(context)) {
    contextLookup[key.toUpperCase()] = value;
  }

  function replaceTag(
    text: string,
    originalTag: string,
    defaultValue: string,
    inputName?: string
  ): string {
    const propertyKey = inputName ?? '';
    const contextKey = propertyKey.replace('-', '').replace('_', '');
    const resolvedValue = contextLookup[contextKey] ?? properties.get(propertyKey) ?? defaultValue;
    return text.replace(originalTag, inputName ? resolvedValue : defaultValue);
  }

  for (const match of text.matchAll(propertyRegEx)) {
    const originalTag = match[0];
    const key = match[1].toUpperCase();
    const value = match[2];
    properties.set(key, value);
    text = replaceTag(text, originalTag, '');
  }

  for (const match of text.matchAll(inputRegEx)) {
    const originalTag = match[0];
    const inputName = match[1].toUpperCase();
    inputs.add(inputName);
    text = replaceTag(text, originalTag, removeUnusedInputs ? '' : inputName, inputName);
  }

  return {
    text: text.trim(),
    inputs,
    properties,
  };
}
