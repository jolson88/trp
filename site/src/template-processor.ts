export interface TemplateProcessingResults {
  text: string,
  inputMarkers: Array<string>,
}

export class TemplateProcessor {
  public process(template: string): TemplateProcessingResults {
    const inputMarkers: Array<string> = [];
    const text = template;

    return {
      text,
      inputMarkers,
    };
  }
}