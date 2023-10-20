export interface TemplateProcessingResults {
  text: string,
  inputMarkers: Array<string>,
}

const markerRegExp = new RegExp(/##(\w+)##/, 'g');

export class TemplateProcessor {
  public process(template: string): TemplateProcessingResults {
    const inputMarkers = new Set<string>();
    const text = template;

    const markerMatches = text.matchAll(markerRegExp);
    for (const match of markerMatches) {
        inputMarkers.add(match[1].toUpperCase())
    }

    return {
      text,
      inputMarkers: Array.from(inputMarkers),
    };
  }
}