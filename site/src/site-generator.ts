import * as fs from "fs/promises";
import * as path from "path";
import { processTemplate } from "./template-processor";

export interface Site {
  about: string;
  blog: string;
  contact: string;
}

export interface SiteContext {
  title: string;
  year: number;
}

const defaultContext: SiteContext = {
  year: new Date().getFullYear(),
  title: "The Reasonable Programmer",
};

export async function generateSite(
  inputDir: string,
  outputDir: string,
  context: SiteContext = defaultContext,
  readFiles = readSiteFiles,
  writeFile = writeSiteFile
): Promise<Array<SiteFile>> {
  const site = await loadSite(inputDir, context, readFiles);
  return writeSite(site, outputDir, writeFile);
}

export async function writeSite(
  site: Site,
  outputDir: string,
  writeFile = writeSiteFile
): Promise<Array<SiteFile>> {
  const siteFiles = [
    { path: "blog.html", content: site.blog },
    { path: "contact.html", content: site.contact },
    { path: "index.html", content: site.about },
  ];
  for (const { path: filePath, content } of siteFiles) {
    await writeFile(path.join(outputDir, filePath), content);
  }
  return siteFiles;
}

export async function loadSite(
  inputDir: string,
  context = defaultContext,
  readFiles = readSiteFiles
): Promise<Site> {
  const siteFiles = await readFiles(inputDir);
  
  const siteTemplate = processTemplate(siteFiles.siteTemplate.content, context);
  const aboutContent = processTemplate(siteFiles.about.content, context);
  const blogContent = processTemplate(siteFiles.blog.content, context);
  const contactContent = processTemplate(siteFiles.contact.content, context);

  return {
    about: processTemplate(siteTemplate.text, { ...context, content: aboutContent.text }).text,
    blog: processTemplate(siteTemplate.text, { ...context, content: blogContent.text }).text,
    contact: processTemplate(siteTemplate.text, { ...context, content: contactContent.text }).text,
  };
}

export interface SiteFiles {
  siteTemplate: SiteFile;
  about: SiteFile;
  blog: SiteFile;
  contact: SiteFile;
}

export interface SiteFile {
  path: string;
  content: string;
}

export async function readSiteFiles(inputDir: string): Promise<SiteFiles> {
  return {
    siteTemplate: await readSiteFile(path.join(inputDir, "_site.html")),
    about: await readSiteFile(path.join(inputDir, "about.html")),
    blog: await readSiteFile(path.join(inputDir, "blog.html")),
    contact: await readSiteFile(path.join(inputDir, "contact.html")),
  };
}

export async function readSiteFile(path: string): Promise<SiteFile> {
  return {
    path,
    content: await fs.readFile(path, { encoding: "utf8" }),
  };
}

export async function writeSiteFile(
  filePath: string,
  content: string
): Promise<boolean> {
  const outputDir = path.parse(filePath).dir;
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(filePath, content);
  return true;
}
