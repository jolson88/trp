import * as fs from "fs/promises";
import * as path from "path";
import { processTemplate } from "./template-processor";
import { FileService, SiteFile, readSiteFiles, writeSiteFile } from "./file-service";

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
  fileService: FileService = new FileService()
): Promise<Array<SiteFile>> {
  const site = await loadSite(inputDir, context, fileService.readSiteFiles.bind(fileService));
  return writeSite(site, outputDir, fileService.writeSiteFile.bind(fileService));
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
