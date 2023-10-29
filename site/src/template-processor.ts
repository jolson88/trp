const inputMarkerRegEx = new RegExp(/##(\w+)##/, "g");
const outputMarkerRegEx = new RegExp(/##(\w+)\s*:\s*([\s\w]+)##/, "g");

export interface TemplateProcessingResults {
  text: string;
  inputMarkers: Array<string>;
  outputMarkers: Array<[string, string]>;
}

export function processPage(
  siteTemplate: string,
  contentTemplate: string,
  context: any = {}
): TemplateProcessingResults {
  const content = processTemplate(contentTemplate, context);
  const processedPage = processTemplate(siteTemplate, {
    ...context,
    content: content.text,
  });

  const outputMarkersMap = new Map<string, string>(content.outputMarkers);
  processedPage.outputMarkers.forEach(([k, v]) => outputMarkersMap.set(k, v));

  return {
    ...processedPage,
    outputMarkers: [...outputMarkersMap.entries()],
  };
}

export function processTemplate(
  template: string,
  context: any = {}
): TemplateProcessingResults {
  function buildLookup(context: any): Map<string, any> {
    const lookup = new Map<string, any>();
    for (let [key, value] of Object.entries(context)) {
      lookup.set(key.toUpperCase(), value);
    }
    return lookup;
  }

  let text = template;
  const contextLookup = buildLookup(context);
  const inputMarkers = new Set<string>();
  const outputMarkers = new Map<string, string>();

  for (const match of text.matchAll(inputMarkerRegEx)) {
    const originalTag = match[0];
    const inputMarker = match[1].toUpperCase();
    inputMarkers.add(inputMarker);
    text = text.replace(
      originalTag,
      contextLookup.get(inputMarker) ?? originalTag
    );
  }

  for (const match of text.matchAll(outputMarkerRegEx)) {
    const originalTag = match[0];
    const key = match[1].toUpperCase();
    const value = match[2];
    outputMarkers.set(key, value);
    text = text.replace(originalTag, "");
  }

  return {
    text: text.trim(),
    inputMarkers: [...inputMarkers],
    outputMarkers: [...outputMarkers.entries()],
  };
}
