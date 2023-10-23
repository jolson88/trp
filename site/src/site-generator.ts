import * as fs from 'fs/promises';
import * as path from 'path';

const inputMarkerRegEx = new RegExp(/##(\w+)##/, 'g');
const outputMarkerRegEx = new RegExp(/##(\w+)\s*:\s*([\s\w]+)##/, 'g');

export interface Site {
  about: string,
  contact: string,
}

export async function loadSite(dir: string, readFile = _readSiteFile): Promise<Site> {
  return _calculateSite({
    about: await readFile(path.join(dir, 'about.html')),
    base: await readFile(path.join(dir, '_base.html')),
    contact: await readFile(path.join(dir, 'contact.html')),
  });
}

export async function createSite(
  site: Site,
  writeFile = _writeSiteFile,
): Promise<Array<SiteFile>> {
  const siteFiles = _calculateSiteFiles(site);
  for (const [filePath, content] of siteFiles) {
    await writeFile(filePath, content);
  }
  return siteFiles;
}

export type SiteFilePath = string;
export type SiteFileContent = string;
export type SiteFile = [SiteFilePath, SiteFileContent];

export async function _readSiteFile(path: SiteFilePath): Promise<SiteFileContent> {
  return await fs.readFile(path, { encoding: 'utf8' });
}

export async function _writeSiteFile(filePath: SiteFilePath, content: SiteFileContent): Promise<boolean> {
  const outputDir = path.parse(filePath).dir;
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(filePath, content);
  return true;
}

export interface SiteTemplates {
  about: string,
  base: string,
  contact: string,
}

export function _calculateSite({ about, base, contact }: SiteTemplates): Site {
  const aboutResults = _processTemplate(base, { content: about });
  const contactResults = _processTemplate(base, { content: contact });

  return {
    about: aboutResults.text,
    contact: contactResults.text,
  }
}

function _calculateSiteFiles(site: Site): Array<SiteFile> {
  return [
    ['index.html', site.about],
    ['contact.html', site.contact],
  ];
}

export interface TemplateProcessingResults {
  text: string,
  inputMarkers: Array<string>,
  outputMarkers: Array<Array<string>>,
}

export function _processTemplate(template: string, context: any = {}): TemplateProcessingResults {
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
