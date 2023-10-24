import * as fs from 'fs/promises';
import * as path from 'path';

const inputMarkerRegEx = new RegExp(/##(\w+)##/, 'g');
const outputMarkerRegEx = new RegExp(/##(\w+)\s*:\s*([\s\w]+)##/, 'g');

export interface Site {
  about: string,
  blog: string,
  contact: string,
}

export interface SiteContext {
  title: string,
  year: number,
}

const defaultContext: SiteContext = {
  year: new Date().getFullYear(),
  title: 'The Reasonable Programmer',
}

export async function createSite(
  site: Site,
  outDir: string,
  writeFile = _writeSiteFile,
): Promise<Array<SiteFile>> {
  const siteFiles: Array<SiteFile> = [
    ['blog.html', site.blog],
    ['contact.html', site.contact],
    ['index.html', site.about],
  ];
  for (const [filePath, content] of siteFiles) {
    await writeFile(path.join(outDir, filePath), content);
  }
  return siteFiles;
}

export async function loadSite(dir: string, context = defaultContext, readFile = _readSiteFile): Promise<Site> {
  const baseTemplate = _processTemplate(await readFile(path.join(dir, '_base.html')), context);
  const aboutTemplate = _processTemplate(await readFile(path.join(dir, 'about.html')), context);
  const blogTemplate = _processTemplate(await readFile(path.join(dir, 'blog.html')), context);
  const contactTemplate = _processTemplate(await readFile(path.join(dir, 'contact.html')), context);

  const aboutResults = _processTemplate(baseTemplate.text, { ...context, content: aboutTemplate.text });
  const blogResults = _processTemplate(baseTemplate.text, { ...context, content: blogTemplate.text });
  const contactResults = _processTemplate(baseTemplate.text, { ...context, content: contactTemplate.text });

  return {
    about: aboutResults.text,
    blog: blogResults.text,
    contact: contactResults.text,
  }
}

type SiteFilePath = string;
type SiteFileContent = string;
type SiteFile = [SiteFilePath, SiteFileContent];

export async function _readSiteFile(path: SiteFilePath): Promise<SiteFileContent> {
  return await fs.readFile(path, { encoding: 'utf8' });
}

export async function _writeSiteFile(filePath: SiteFilePath, content: SiteFileContent): Promise<boolean> {
  const outputDir = path.parse(filePath).dir;
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(filePath, content);
  return true;
}

interface TemplateProcessingResults {
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
