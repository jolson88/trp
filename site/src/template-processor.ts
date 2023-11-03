const escapedValidKeyCharacters = '\\w\\-\\_';
const escapedValidValueCharacters = '\\s\\w\\/\\\\\\.\\-\\_';
const escapedSeparator = '\\s*:\\s*';
const inputMarkerRegEx = new RegExp(`##([${escapedValidKeyCharacters}]+)##`, 'g');
const outputMarkerRegEx = new RegExp(
  `##([${escapedValidKeyCharacters}]+)${escapedSeparator}([${escapedValidValueCharacters}]+)##`,
  'g'
);

export interface TemplateProcessingResults {
  text: string;
  inputMarkers: Set<string>;
  outputMarkers: Map<string, string>;
}

export function processPage(
  pageTemplate: string,
  childTemplate: string,
  context: any = {}
): TemplateProcessingResults {
  const processedChild = processTemplate(childTemplate, context);
  const processedPage = processTemplate(pageTemplate, {
    ...context,
    child: processedChild.text,
  });

  const outputMarkers = new Map<string, string>(processedChild.outputMarkers.entries());
  [...processedPage.outputMarkers.entries()].forEach(([k, v]) => outputMarkers.set(k, v));

  return {
    ...processedPage,
    outputMarkers,
  };
}

function processTemplate(template: string, context: any = {}): TemplateProcessingResults {
  function replaceTag(text: string, originalTag: string, inputMarker?: string): string {
    const key = (inputMarker ?? '').replace('-', '').replace('_', '');
    const resolvedValue = contextLookup[key] ?? '';
    return text.replace(originalTag, inputMarker ? resolvedValue : '');
  }

  const contextLookup = { ...context };
  for (let [key, value] of Object.entries(context)) {
    contextLookup[key.toUpperCase()] = value;
  }

  let text = template;
  const inputMarkers = new Set<string>();
  for (const match of text.matchAll(inputMarkerRegEx)) {
    const originalTag = match[0];
    const inputMarker = match[1].toUpperCase();
    inputMarkers.add(inputMarker);
    text = replaceTag(text, originalTag, inputMarker);
  }

  const outputMarkers = new Map<string, string>();
  for (const match of text.matchAll(outputMarkerRegEx)) {
    const originalTag = match[0];
    const key = match[1].toUpperCase();
    const value = match[2];
    outputMarkers.set(key, value);
    text = replaceTag(text, originalTag);
  }

  return {
    text: text.trim(),
    inputMarkers,
    outputMarkers,
  };
}
