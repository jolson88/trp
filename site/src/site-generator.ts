import * as fs from 'fs/promises';
import * as path from 'path';

const inputMarkerRegEx = new RegExp(/##(\w+)##/, 'g');
const outputMarkerRegEx = new RegExp(/##(\w+)\s*:\s*([\s\w]+)##/, 'g');

export interface Site {
  about: string,
  contact: string,
}

export async function createSite(
  site: Site,
  fileWriter: (filePath: SiteFilePath, content: SiteFileContent) => Promise<boolean> = writeSiteFile,
): Promise<void> {
  const siteFiles = calculateSiteFiles(site);
  for (const [filePath, content] of siteFiles) {
    await fileWriter(filePath, content);
  }
}

export type SiteFilePath = string;
export type SiteFileContent = string;
export type SiteFile = [SiteFilePath, SiteFileContent];

export async function readSiteFile(path: SiteFilePath): Promise<SiteFileContent> {
  return await fs.readFile(path, { encoding: 'utf8' });
}

export async function writeSiteFile(filePath: SiteFilePath, content: SiteFileContent): Promise<boolean> {
  const outputDir = path.parse(filePath).dir;
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(filePath, content);
  return true;
}

function calculateSiteFiles(site: Site): Array<SiteFile> {
  return [
    ['index.html', site.about],
    ['contact.html', site.contact],
  ];
}

export interface SiteTemplates {
  about: string,
  base: string,
  contact: string,
}

export function calculateSite({ about, base, contact }: SiteTemplates): Site {
  const aboutResults = processTemplate(base, { content: about });
  const contactResults = processTemplate(base, { content: contact });

  return {
    about: aboutResults.text,
    contact: contactResults.text,
  }
}

export interface TemplateProcessingResults {
  text: string,
  inputMarkers: Array<string>,
  outputMarkers: Array<Array<string>>,
}

export function processTemplate(template: string, context: any = {}): TemplateProcessingResults {
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
    inputMarkers.add(inputMarker)
    text = text.replace(originalTag, contextLookup.get(inputMarker) ?? originalTag);
  }

  for (const match of text.matchAll(outputMarkerRegEx)) {
    const originalTag = match[0];
    const key = match[1].toUpperCase();
    const value = match[2];
    outputMarkers.set(key, value);
    text = text.replace(originalTag, '');
  }

  return {
    text: text.trim(),
    inputMarkers: [...inputMarkers],
    outputMarkers: [...outputMarkers.entries()],
  };
}
