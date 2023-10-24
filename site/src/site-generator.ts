import * as fs from 'fs/promises';
import * as path from 'path';
import { processTemplate } from './template-processor';

export interface Site {
  about: string,
  blog: string,
  contact: string,
}

export interface SiteFile {
  path: string,
  content: string,
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
  const siteFiles = [
    { path: 'blog.html', content: site.blog },
    { path: 'contact.html', content: site.contact },
    { path: 'index.html', content: site.about },
  ];
  for (const { path: filePath, content } of siteFiles) {
    await writeFile(path.join(outDir, filePath), content);
  }
  return siteFiles;
}

export async function loadSite(dir: string, context = defaultContext, readFile = _readSiteFile): Promise<Site> {
  const siteTemplate = processTemplate(await readFile(path.join(dir, '_site.html')), context);

  const aboutTemplate = processTemplate(await readFile(path.join(dir, 'about.html')), context);
  const blogTemplate = processTemplate(await readFile(path.join(dir, 'blog.html')), context);
  const contactTemplate = processTemplate(await readFile(path.join(dir, 'contact.html')), context);

  const aboutResults = processTemplate(siteTemplate.text, { ...context, content: aboutTemplate.text });
  const blogResults = processTemplate(siteTemplate.text, { ...context, content: blogTemplate.text });
  const contactResults = processTemplate(siteTemplate.text, { ...context, content: contactTemplate.text });

  return {
    about: aboutResults.text,
    blog: blogResults.text,
    contact: contactResults.text,
  }
}

export async function _readSiteFile(path: string): Promise<string> {
  return await fs.readFile(path, { encoding: 'utf8' });
}

export async function _writeSiteFile(filePath: string, content: string): Promise<boolean> {
  const outputDir = path.parse(filePath).dir;
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(filePath, content);
  return true;
}
