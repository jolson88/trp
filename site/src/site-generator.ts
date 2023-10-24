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

// I think after readFile is changed to read all project files, this will become easier to test/mock.
// After we do this, we might be able to inline loadSite and writeSite to reduce the # of concepts remaining in this file
export async function generateSite(
  inputDir: string,
  outputDir: string,
  context: SiteContext = defaultContext,
  readFile = _readSiteFile,
  writeFile = _writeSiteFile,
): Promise<Array<SiteFile>> {
  const site = await loadSite(inputDir, context, readFile);
  return writeSite(site, outputDir, writeFile);
}

export async function writeSite(
  site: Site,
  outputDir: string,
  writeFile = _writeSiteFile,
): Promise<Array<SiteFile>> {
  const siteFiles = [
    { path: 'blog.html', content: site.blog },
    { path: 'contact.html', content: site.contact },
    { path: 'index.html', content: site.about },
  ];
  for (const { path: filePath, content } of siteFiles) {
    await writeFile(path.join(outputDir, filePath), content);
  }
  return siteFiles;
}

export async function loadSite(inputDir: string, context = defaultContext, readFile = _readSiteFile): Promise<Site> {
  const siteTemplate = processTemplate(await readFile(path.join(inputDir, '_site.html')), context);

  const aboutTemplate = processTemplate(await readFile(path.join(inputDir, 'about.html')), context);
  const blogTemplate = processTemplate(await readFile(path.join(inputDir, 'blog.html')), context);
  const contactTemplate = processTemplate(await readFile(path.join(inputDir, 'contact.html')), context);

  const aboutResults = processTemplate(siteTemplate.text, { ...context, content: aboutTemplate.text });
  const blogResults = processTemplate(siteTemplate.text, { ...context, content: blogTemplate.text });
  const contactResults = processTemplate(siteTemplate.text, { ...context, content: contactTemplate.text });

  return {
    about: aboutResults.text,
    blog: blogResults.text,
    contact: contactResults.text,
  }
}

// TODO: Instead of individual calls to _readSiteFile, make it a _readInputFiles that will return a POJO for input files given an input dir
// Something akin to { siteTemplate: SiteFile, aboutContent: SiteFile, contactContent: SiteFile }
// This will also set us up for having a list of blogs in the future (e.g. `blogs: Array<SiteFile>  )
// This also provides us a foundation to introduce a less anemic file-service we could move to
// This will also make it easier to test because it can be mocked in one call vs. dynamic lookup based on incoming path
export async function _readSiteFile(path: string): Promise<string> {
  return await fs.readFile(path, { encoding: 'utf8' });
}

export async function _writeSiteFile(filePath: string, content: string): Promise<boolean> {
  const outputDir = path.parse(filePath).dir;
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(filePath, content);
  return true;
}
